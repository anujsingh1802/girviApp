import React from 'react';

const AddCustomer = ({ navigateTo }) => (
  <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
    <div className="bg-primary text-white px-6 py-5 md:py-6 flex items-center gap-4 sticky top-0 z-20 shadow-md">
      <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('home')}>arrow_back</span>
      <h2 className="text-xl md:text-2xl font-semibold">Add Customer</h2>
    </div>

    <div className="view-padding py-8 flex-1 overflow-y-auto pb-6 max-w-5xl mx-auto w-full">
      <div className="flex md:justify-start justify-center mb-10 md:mb-12">
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-blue-100 dark:bg-blue-900 border-4 border-card shadow-lg flex items-center justify-center">
          <span className="icon text-[64px] text-primary dark:text-blue-300">person</span>
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-card cursor-pointer hover:bg-primary-dark transition-colors">
            <span className="icon text-[18px]">photo_camera</span>
          </div>
        </div>
        <div className="hidden md:flex flex-col justify-center ml-8">
            <h3 className="text-2xl font-bold text-textMain">Customer Profile</h3>
            <p className="text-textMuted">Upload a clear picture of the customer.</p>
        </div>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-2xl border border-borderBase shadow-sm">
        <h4 className="text-lg font-bold text-textMain mb-6 border-b border-borderBase pb-3">Personal Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-textMain mb-2">First name *</label>
            <input type="text" placeholder="Enter first name" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-textMain mb-2">Middle name</label>
            <input type="text" placeholder="Enter middle name" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-textMain mb-2">Last name *</label>
            <input type="text" placeholder="Enter last name" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-textMain mb-2">Mobile number *</label>
            <input type="tel" placeholder="+91 00000 00000" className="input-field" />
          </div>
          
          <div className="md:col-span-2 flex items-end pb-2">
             <div className="flex items-center gap-2 text-primary font-semibold cursor-pointer hover:underline">
               <span className="icon">add_circle</span>
               <span>Add Alternate Mobile</span>
             </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-sm font-semibold text-textMain mb-2">Email address</label>
            <input type="email" placeholder="customer@example.com" className="input-field lg:w-1/2" />
          </div>
          
          <div className="lg:col-span-3">
            <label className="block text-sm font-semibold text-textMain mb-2">Permanent Address</label>
            <textarea placeholder="Enter full address details..." rows="3" className="input-field resize-none"></textarea>
          </div>
        </div>

        <h4 className="text-lg font-bold text-textMain mt-10 mb-6 border-b border-borderBase pb-3">Documentation</h4>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <span className="block text-sm font-semibold text-textMain mb-2">Upload Aadhaar Card :</span>
            <div className="border-2 border-dashed border-borderBase rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-textMuted bg-background cursor-pointer hover:border-primary transition-colors h-32">
              <span className="icon text-primary text-3xl">cloud_upload</span> 
              <span className="font-medium text-sm">Click to upload file (JPG, PDF)</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="block text-sm font-semibold text-textMain mb-2">Upload PAN Card :</span>
            <div className="border-2 border-dashed border-borderBase rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-textMuted bg-background cursor-pointer hover:border-primary transition-colors h-32">
               <span className="icon text-primary text-3xl">cloud_upload</span> 
               <span className="font-medium text-sm">Click to upload file (JPG, PDF)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-primary font-semibold py-4 cursor-pointer hover:underline">
          <span className="icon">add_circle</span>
          <span>Add Other Document</span>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-textMain mb-2">Additional Notes :</label>
          <textarea placeholder="Any special instructions or notes..." rows="4" className="input-field resize-none"></textarea>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-4 mt-8 md:justify-end">
        <button className="btn bg-card border-2 border-primary-dark text-primary-dark font-bold shadow-sm hover:bg-gray-50 flex-none md:px-10">
          Save & Create Loan <span className="icon text-[18px]">arrow_forward</span>
        </button>
        <button className="btn bg-primary-dark text-white rounded-xl font-bold shadow-md hover:bg-primary py-4 flex-none md:px-16">
          Save Customer
        </button>
      </div>
    </div>
  </div>
);

export default AddCustomer;