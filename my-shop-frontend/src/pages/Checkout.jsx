import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { CartContext } from '../context/CartContext';
import { MapPin, Phone, Loader2, Navigation, CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import L from 'leaflet';
import { toast } from 'react-hot-toast';
import API from '../services/api';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix for Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const SearchField = ({ setFormData }) => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider, style: 'bar', showMarker: false, animateZoom: true, autoClose: true,
      searchLabel: 'Search neighborhood...',
    });
    map.addControl(searchControl);
    map.on('geosearch/showlocation', (res) => {
      setFormData(prev => ({ ...prev, latitude: res.location.y, longitude: res.location.x }));
    });
    return () => map.removeControl(searchControl);
  }, [map, setFormData]);
  return null;
};

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    city: 'Addis Ababa', 
    subCity: '', 
    woreda: '', 
    phone: '', 
    latitude: 9.03, 
    longitude: 38.74
  });

  const cities = ["Addis Ababa", "Adama", "Bahir Dar", "Hawassa", "Dire Dawa"];
  const subCities = ["Bole", "Yeka", "Arada", "Kirkos", "Gullele", "Akaki-Kality", "Nifas Silk-Lafto", "Kolfe Keranio", "Lideta", "Addis Ketema"];
  const woredas = Array.from({ length: 15 }, (_, i) => `Woreda ${String(i + 1).padStart(2, '0')}`);

  const handleLocateMe = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
    }, () => toast.error('GPS access denied'));
  };

  const LocationMarker = () => {
    const map = useMap();
    useEffect(() => { map.flyTo([formData.latitude, formData.longitude], 16); }, [formData.latitude, formData.longitude]);
    useMapEvents({ click(e) { setFormData(prev => ({ ...prev, latitude: e.latlng.lat, longitude: e.latlng.lng })); } });
    return <Marker position={[formData.latitude, formData.longitude]} />;
  };

 const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Your cart is empty");

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: getCartTotal(),
        ...formData // Includes city, subCity, woreda, phone, lat, long
      };

      const response = await API.post('/orders', orderData);
      
      // Extract the order ID returned by your backend
      const finalOrderId = response.data.order?.id || response.data.orderId;

      if (finalOrderId) {
        // 1. Clear the cart state (local and DB via context)
        clearCart(); 
        
        toast.success("Order Placed! Please complete payment.");

        // 2. REDIRECT to Payment Instructions instead of My Orders
        navigate(`/payment-instructions`, { 
          state: { 
            orderId: finalOrderId, 
            totalPrice: getCartTotal() 
          } 
        });
      } else {
        throw new Error("Order ID not returned from server");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error(err.response?.data?.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <form onSubmit={handlePlaceOrder} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-blue-50">
        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <ShoppingBag className="text-blue-600"/> Checkout
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">City</label>
            <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" 
              value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Sub-City</label>
              <select required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" 
                onChange={e => setFormData({...formData, subCity: e.target.value})}>
                <option value="">Select</option>
                {subCities.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Woreda</label>
              <select required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" 
                onChange={e => setFormData({...formData, woreda: e.target.value})}>
                <option value="">Select</option>
                {woredas.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Phone</label>
            <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input required type="tel" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none" placeholder="09..." 
                  onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="h-64 rounded-[2rem] overflow-hidden border relative">
          <MapContainer center={[9.03, 38.74]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SearchField setFormData={setFormData} />
            <LocationMarker />
          </MapContainer>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 flex justify-center items-center gap-3 shadow-xl">
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={24}/>}
          {loading ? "Processing..." : `Place Order • $${getCartTotal().toFixed(2)}`}
        </button>
      </form>

      <div className="bg-gray-50 p-10 rounded-[3rem] h-fit border border-gray-100 sticky top-10">
        <h3 className="text-xl font-black mb-6">Order Summary</h3>
        <div className="space-y-4 mb-6 border-b pb-6">
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-bold text-xs uppercase">Grand Total</span>
          <span className="text-4xl font-black text-blue-600">${getCartTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;