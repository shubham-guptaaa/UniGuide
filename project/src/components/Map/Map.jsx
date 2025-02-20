import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  
  const mapContainerStyle = {
    width: '100%',
    height: '100vh'
  };
  
  const center = {
    lat: 48.8719556,
    lng: 2.3415407
  };

  useEffect(() => {
    const fetchMapData = async () => {
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'maps-data.p.rapidapi.com',
          'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY
        }
      };

      try {
        const response = await fetch(
          `https://maps-data.p.rapidapi.com/whatishere.php?lat=${center.lat}&lng=${center.lng}&lang=en&country=us`,
          options
        );
        const data = await response.json();
        setMapData(data.data || []);
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchMapData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data);
      
      if (data.length > 0) {
        const firstResult = data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);
        
        setMapData([...mapData, {
          lat: lat,
          lon: lon,
          name: firstResult.display_name,
          type: 'Search Result'
        }]);

        if (mapRef) {
          mapRef.setView([lat, lon], 13);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="container flex gap-4 items-center mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex gap-2 items-center px-4 py-2 bg-white rounded-full shadow-lg transition-colors hover:bg-gray-100"
          >
            <IoArrowBack /> 
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-1 gap-2 mx-auto max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="px-4 py-2 w-full rounded-full border border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-500 rounded-full shadow-lg transition-colors hover:bg-blue-600"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* Map */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={mapContainerStyle}
        ref={setMapRef}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          maxZoom={20}
        />
        
        {mapData.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lon]}
            eventHandlers={{
              click: () => setSelectedMarket(location),
            }}
          >
            {selectedMarket === location && (
              <Popup onClose={() => setSelectedMarket(null)}>
                <div className="p-2">
                  <h3 className="font-bold">{location.name}</h3>
                  <p className="text-sm">{location.type}</p>
                  <button
                    onClick={() => navigate(`/market/${location.id}`)}
                    className="px-4 py-2 mt-3 w-full text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map; 