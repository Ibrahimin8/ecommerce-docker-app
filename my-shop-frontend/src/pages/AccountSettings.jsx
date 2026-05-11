import React from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, ChevronRight, Settings } from 'lucide-react';

const AccountSettings = () => {
  const menuItems = [
    { title: "Edit Profile", desc: "Change name and email", icon: <User />, link: "/update-profile", color: "text-blue-600 bg-blue-50" },
    { title: "Security", desc: "Update your password", icon: <Lock />, link: "/change-password", color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-16 px-4 bg-gray-50/50">
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <Settings className="text-gray-400" /> Account Settings
        </h1>
        
        <div className="flex flex-col gap-4">
          {menuItems.map((item, idx) => (
            <Link key={idx} to={item.link} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all group">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${item.color}`}>{item.icon}</div>
                <div>
                  <h3 className="font-black text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;