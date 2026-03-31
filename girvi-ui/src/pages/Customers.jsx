import React, { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../api';

const Customers = ({ navigateTo, setSelectedCustomer }) => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(API_ENDPOINTS.CUSTOMERS);
        if (!res.ok) {
          throw new Error("Failed to load customers");
        }
        const data = await res.json();
        if (isMounted) {
          setCustomers(Array.isArray(data.customers) ? data.customers : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCustomers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) => {
      const name = customer.name?.toLowerCase() || "";
      const phone = customer.phone?.toLowerCase() || "";
      const email = customer.email?.toLowerCase() || "";
      return name.includes(query) || phone.includes(query) || email.includes(query);
    });
  }, [customers, search]);

  return (
    <div className="flex flex-col min-h-full bg-background view-padding pt-6 md:pt-10 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-bold text-textMain">Customers</h2>
          <span className="text-textMuted text-sm">{loading ? "Loading..." : `${filteredCustomers.length} customer${filteredCustomers.length === 1 ? "" : "s"}`}</span>
        </div>
        <div className="bg-card p-2 rounded-lg border border-borderBase cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="icon text-textMain">filter_list</span>
        </div>
      </div>
      
      <div className="bg-card px-5 py-4 rounded-xl border border-borderBase flex items-center gap-3 shadow-sm mb-6 transition-colors duration-300">
        <span className="icon text-textMuted text-xl">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or mobile number..."
          className="w-full bg-transparent outline-none text-textMain placeholder-textMuted font-medium text-base md:text-lg"
        />
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-borderBase">
          <span className="icon text-red-400 text-[80px] mb-6">error</span>
          <p className="text-textMuted font-semibold text-xl">{error}</p>
          <p className="text-gray-400 text-sm mt-2 text-center max-w-sm">Check that the backend is running and MongoDB is connected.</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-borderBase">
          <span className="icon text-gray-300 dark:text-gray-600 text-[80px] mb-6">person_off</span>
          <p className="text-textMuted font-semibold text-xl">No Customers found!</p>
          <p className="text-gray-400 text-sm mt-2 text-center max-w-sm">You haven't added any customers yet. Add a new customer to start creating loans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-28">
          {filteredCustomers.map((customer) => (
            <div key={customer._id} onClick={() => { setSelectedCustomer(customer._id); navigateTo('customer-profile'); }} className="card flex flex-col gap-3 cursor-pointer hover:-translate-y-1 transition-transform border border-borderBase hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {customer.profileUrl ? (
                    <img src={customer.profileUrl} alt={customer.name} className="w-10 h-10 rounded-full object-cover border border-borderBase shadow-sm bg-background" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-light/20 text-primary-dark flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold">{customer.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-textMain font-semibold text-lg leading-tight">{customer.name}</span>
                    <span className="text-textMuted text-xs mt-0.5">{customer.email || "Email not added"}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-light/20 text-primary-dark shrink-0">Customer</span>
              </div>
              <div className="flex flex-col gap-2 text-sm text-textMuted">
                <div className="flex items-center gap-2">
                  <span className="icon text-base">call</span>
                  <span>{customer.phone || "NA"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="icon text-base">home</span>
                  <span className="truncate">{customer.address || "Address not added"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-borderBase text-xs text-textMuted">
                <span>Joined</span>
                <span>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Local FAB just for customers */}
      <button onClick={() => navigateTo('add-customer')} className="fixed bottom-24 md:bottom-28 right-5 md:right-10 lg:right-16 w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-[20px] shadow-fab flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
        <span className="icon md:text-3xl">add</span>
      </button>
    </div>
  );
};

export default Customers;
