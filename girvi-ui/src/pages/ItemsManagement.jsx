import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api';

const ItemsManagement = ({ navigateTo }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ENDPOINTS.ITEMS_ALL)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
      <div className="bg-primary text-white px-6 py-5 md:py-6 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('account')}>arrow_back</span>
        <h2 className="text-xl md:text-2xl font-semibold">Items Management</h2>
      </div>

      <div className="view-padding py-8 flex-1 overflow-y-auto max-w-6xl mx-auto w-full">
        <h4 className="font-bold text-textMain mb-4 ml-1 text-lg">Pledged Collaterals</h4>
        
        {loading ? (
          <div className="p-10 text-center"><span className="icon animate-spin text-3xl text-primary">autorenew</span></div>
        ) : items.length === 0 ? (
          <div className="text-center p-10 bg-card rounded-2xl border border-borderBase"><span className="icon text-gray-400 text-5xl mb-3 block">inventory_2</span><p className="text-textMuted">No collateral items found in the system.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item._id} className="card !p-5 border border-borderBase hover:shadow-lg transition-shadow relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-textMain">{item.itemName}</h3>
                    <span className="text-xs font-semibold text-textMuted bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md mt-1 inline-block">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-textMuted block">Est. Value</span>
                    <span className="font-bold text-green-600 dark:text-green-400">₹{item.estimatedValue}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-sm mb-4">
                   <div className="flex justify-between border-b border-borderBase border-dashed py-1">
                     <span className="text-textMuted text-xs">Customer</span>
                     <span className="font-bold text-textMain">{item.userId?.name || "Unknown"}</span>
                   </div>
                   <div className="flex justify-between border-b border-borderBase border-dashed py-1">
                     <span className="text-textMuted text-xs">Customer Phone</span>
                     <span className="font-bold text-primary">{item.userId?.phone || "Unknown"}</span>
                   </div>
                   {(Number(item.netWeight) > 0 || Number(item.grossWeight) > 0) && (
                     <div className="flex justify-between border-b border-borderBase border-dashed py-1">
                       <span className="text-textMuted text-xs">Weight</span>
                       <span className="font-bold text-textMain text-xs">N: {item.netWeight}g | G: {item.grossWeight}g</span>
                     </div>
                   )}
                </div>

                {item.images && item.images.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1 mt-auto">
                    {item.images.map((img, i) => (
                      <img key={i} src={img} alt="item" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-borderBase shadow-sm" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsManagement;
