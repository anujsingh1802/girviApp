import React, { useState } from 'react';
import API_BASE_URL, { API_ENDPOINTS } from '../api';
import SignatureModal from '../components/SignatureModal';

const AddCustomer = ({ navigateTo }) => {
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', mobile: '', email: '', address: '', notes: ''
  });
  
  const [aadhaarUrl, setAadhaarUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(type);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        if (type === 'aadhaar') setAadhaarUrl(result.url);
        if (type === 'pan') setPanUrl(result.url);
        if (type === 'profile') setProfileUrl(result.url);
        if (type === 'signature') setSignatureUrl(result.url);
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploadingDoc('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { firstName, middleName, lastName, mobile, email, address, notes } = formData;
    if (!firstName || !lastName || !mobile) {
      alert("Please fill in the required fields (*)");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' '),
        phone: mobile,
        email,
        address,
        profileUrl,
        aadhaarUrl,
        panUrl,
        signatureUrl,
        notes
      };

      const res = await fetch(API_ENDPOINTS.CUSTOMER_SINGLE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Customer saved successfully!");
        navigateTo('home');
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
      <div className="bg-primary text-white px-6 py-5 md:py-6 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('home')}>arrow_back</span>
        <h2 className="text-xl md:text-2xl font-semibold">Add Customer</h2>
      </div>

      <div className="view-padding py-8 flex-1 overflow-y-auto pb-6 max-w-5xl mx-auto w-full">
        <div className="flex md:justify-start justify-center mb-10 md:mb-12">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-blue-100 dark:bg-blue-900 border-4 border-card shadow-lg flex items-center justify-center overflow-hidden">
            {profileUrl ? (
              <img src={profileUrl} alt="Customer" className="w-full h-full object-cover" />
            ) : (
              <span className="icon text-[64px] text-primary dark:text-blue-300">person</span>
            )}
            <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-card cursor-pointer hover:bg-primary-dark transition-colors overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'profile')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {uploadingDoc === 'profile' ? (
                <span className="text-xs font-semibold">...</span>
              ) : (
                <span className="icon text-[18px]">photo_camera</span>
              )}
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
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Middle name</label>
              <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder="Enter middle name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Last name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Mobile number *</label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+91 00000 00000" className="input-field" />
            </div>
            
            <div className="md:col-span-2 flex items-end pb-2">
               <div className="flex items-center gap-2 text-primary font-semibold cursor-pointer hover:underline">
                 <span className="icon">add_circle</span>
                 <span>Add Alternate Mobile</span>
               </div>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-textMain mb-2">Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="customer@example.com" className="input-field lg:w-1/2" />
            </div>
            
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-textMain mb-2">Permanent Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter full address details..." rows="3" className="input-field resize-none"></textarea>
            </div>
          </div>

          <h4 className="text-lg font-bold text-textMain mt-10 mb-6 border-b border-borderBase pb-3">Documentation</h4>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <span className="block text-sm font-semibold text-textMain mb-2">Upload Aadhaar Card :</span>
              <div className="border-2 border-dashed border-borderBase rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-textMuted bg-background cursor-pointer hover:border-primary transition-colors h-32 relative overflow-hidden">
                <input type="file" onChange={(e) => handleFileUpload(e, 'aadhaar')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {uploadingDoc === 'aadhaar' ? (
                  <span className="font-medium text-sm text-primary">Uploading...</span>
                ) : aadhaarUrl ? (
                  <div className="flex flex-col items-center">
                    <span className="icon text-green-500 text-3xl">check_circle</span>
                    <span className="font-medium text-sm text-green-500 truncate w-full px-2 text-center">Uploaded</span>
                  </div>
                ) : (
                  <>
                    <span className="icon text-primary text-3xl">cloud_upload</span> 
                    <span className="font-medium text-sm">Click to upload file (JPG, PDF)</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 relative">
              <span className="block text-sm font-semibold text-textMain mb-2">Upload PAN Card :</span>
              <div className="border-2 border-dashed border-borderBase rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-textMuted bg-background cursor-pointer hover:border-primary transition-colors h-32 relative overflow-hidden">
                <input type="file" onChange={(e) => handleFileUpload(e, 'pan')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {uploadingDoc === 'pan' ? (
                  <span className="font-medium text-sm text-primary">Uploading...</span>
                ) : panUrl ? (
                   <div className="flex flex-col items-center">
                    <span className="icon text-green-500 text-3xl">check_circle</span>
                    <span className="font-medium text-sm text-green-500 truncate w-full px-2 text-center">Uploaded</span>
                  </div>
                ) : (
                  <>
                    <span className="icon text-primary text-3xl">cloud_upload</span> 
                    <span className="font-medium text-sm">Click to upload file (JPG, PDF)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-primary font-semibold py-4 cursor-pointer hover:underline">
            <span className="icon">add_circle</span>
            <span>Add Other Document</span>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-textMain mb-2">Additional Notes :</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any special instructions or notes..." rows="4" className="input-field resize-none"></textarea>
          </div>

          <h4 className="text-lg font-bold text-textMain mt-10 mb-6 border-b border-borderBase pb-3">Customer Signature</h4>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full relative">
              <div 
                className="border-2 border-dashed border-borderBase rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-textMuted bg-background cursor-pointer hover:border-primary transition-colors min-h-[160px] relative overflow-hidden"
                onClick={() => setIsSignatureModalOpen(true)}
              >
                {signatureUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={signatureUrl} alt="Signature" className="max-h-24 md:max-h-32 object-contain bg-white rounded-lg shadow-sm p-2" />
                    <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                      <span className="icon text-[14px]">check_circle</span> Signature Captured
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="icon text-primary text-[48px]">draw</span> 
                    <span className="font-semibold text-sm">Click to add customer signature</span>
                    <span className="text-xs text-textMuted">(Opens in landscape mode)</span>
                  </>
                )}
                {uploadingDoc === 'signature' && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                     <span className="font-medium text-sm text-primary">Uploading Signature...</span>
                   </div>
                )}
              </div>
            </div>
            <div className="md:w-1/3 flex flex-col gap-2">
               <button 
                 type="button"
                 onClick={() => setIsSignatureModalOpen(true)}
                 className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all text-sm"
               >
                 <span className="icon text-[18px]">edit</span>
                 {signatureUrl ? "Redraw Signature" : "Capture Signature"}
               </button>
               <p className="text-xs text-textMuted italic">
                 Signatures are securely stored and will be used on official receipts.
               </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-4 mt-8 md:justify-end">
          <button className="btn bg-card border-2 border-primary-dark text-primary-dark font-bold shadow-sm hover:bg-gray-50 flex-none md:px-10" disabled={loading}>
            Save & Create Loan <span className="icon text-[18px]">arrow_forward</span>
          </button>
          <button onClick={handleSave} disabled={loading} className="btn bg-primary-dark text-white rounded-xl font-bold shadow-md hover:bg-primary py-4 flex-none md:px-16 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </div>
      
      <SignatureModal 
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={async (dataURL) => {
          // Convert dataURL (base64) to Blob
          const blob = await (await fetch(dataURL)).blob();
          const file = new File([blob], "signature.png", { type: "image/png" });
          
          const event = { target: { files: [file] } };
          await handleFileUpload(event, 'signature');
          setSignatureUrl(dataURL); // Show preview immediately while uploading if needed, but handleFileUpload will update URL
        }}
      />
    </div>
  );
};

export default AddCustomer;
