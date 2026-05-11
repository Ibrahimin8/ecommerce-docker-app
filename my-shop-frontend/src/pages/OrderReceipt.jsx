import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const OrderReceipt = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} className="p-16 bg-white text-black w-[210mm] min-h-[297mm] font-sans">
      <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">INVOICE</h1>
          <p className="text-sm mt-2 font-bold text-gray-500">Order ID: <span className="text-black">#{order.id}</span></p>
          <p className="text-sm font-bold text-gray-500">Date: <span className="text-black">{new Date(order.createdAt).toLocaleDateString()}</span></p>
        </div>
        <div className="text-right flex flex-col items-end">
          <QRCodeSVG value={`https://yourstore.com/orders/${order.id}`} size={80} />
          <p className="text-[9px] font-bold mt-1 uppercase text-gray-400">Scan to Verify</p>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-black uppercase text-gray-400 mb-2">Delivery Details:</h3>
        <p className="font-black text-lg">{order.User?.name || 'Customer'}</p>
        <p className="text-sm font-bold">{order.phone}</p>
        <p className="text-sm text-gray-600">{order.city}, {order.subCity}, {order.woreda}</p>
      </div>

      <table className="w-full mb-10">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-4 text-xs font-black uppercase">Item</th>
            <th className="py-4 text-xs font-black uppercase text-center">Qty</th>
            <th className="py-4 text-xs font-black uppercase text-right">Price</th>
            <th className="py-4 text-xs font-black uppercase text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <tr key={item.id}>
              <td className="py-5 font-bold">{item.name || item.product?.name}</td>
              <td className="py-5 text-center font-bold">{item.quantity}</td>
              <td className="py-5 text-right font-bold">${parseFloat(item.price).toFixed(2)}</td>
              <td className="py-5 text-right font-black">${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end pt-6 border-t-2 border-black">
        <div className="w-1/3 space-y-2">
          <div className="flex justify-between text-2xl font-black">
            <span>TOTAL</span>
            <span>${parseFloat(order.totalPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default OrderReceipt;