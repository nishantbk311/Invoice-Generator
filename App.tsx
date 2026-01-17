
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { InvoiceData, LineItem } from './types';
import { Editable } from './components/Editable';

const DEFAULT_LOGO_SVG = `<svg viewBox="0 0 100 100" className="w-full h-full">
  <path d="M20 80 L50 20 L80 80" stroke="black" strokeWidth="6" fill="none" strokeLinejoin="round" />
  <path d="M40 80 L65 35 L90 80" stroke="black" strokeWidth="6" fill="none" strokeLinejoin="round" />
</svg>`;

const INITIAL_DATA: InvoiceData = {
  logo: "/logo.png",
  invoiceNo: '#LL93784',
  date: '17-0-2026',
  companyName: 'INVOMA LTD',
  client: {
    name: 'Lowell H. Dominguez 84',
    address: 'Spilman Street, London',
    cityStateZip: 'England EC2A 4NE',
    email: 'demo@gmail.com'
  },
  payor: {
    name: 'Laralink Ltd',
    address: '86-90 Paul Street, London',
    cityStateZip: 'England EC2A 4NE',
    email: 'demo@gmail.com'
  },
  items: [
    { id: '1', name: 'Website Design', description: 'Six web page designs and three times revision', price: 400, qty: 5 },
    { id: '2', name: 'Web Development', description: 'Convert pixel-perfect frontend and make it dynamic', price: 400, qty: 4 },
    { id: '3', name: 'App Development', description: 'Android And Ios Application Development', price: 450, qty: 3 },
    { id: '4', name: 'Digital Marketing', description: 'Facebook, Youtube and Google Marketing', price: 500, qty: 1 },
  ],
  paymentMethod: 'Cradit Card - 236***********928',
  taxRate: 10,
  terms: [
    'All claims relating to quantity or shipping errors shall be waived by Buyer unless made in writing to Seller within thirty (30) days after delivery of goods to the address stated.',
    'Delivery dates are not guaranteed and Seller has no liability for damages that may be incurred due to any delay in shipment of goods hereunder. Taxes are excluded unless otherwise stated.'
  ]
};

const App: React.FC = () => {
  const [data, setData] = useState<InvoiceData>(() => ({ ...INITIAL_DATA }));
  const invoiceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subTotal = useMemo(() => {
    return data.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [data.items]);

  const taxAmount = useMemo(() => {
    return (subTotal * data.taxRate) / 100;
  }, [subTotal, data.taxRate]);

  const grandTotal = useMemo(() => {
    return subTotal + taxAmount;
  }, [subTotal, taxAmount]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setData(prev => ({ ...prev, logo: undefined }));
  };

  const updateClient = (key: keyof typeof data.client, value: string) => {
    setData(prev => ({ ...prev, client: { ...prev.client, [key]: value } }));
  };

  const updatePayor = (key: keyof typeof data.payor, value: string) => {
    setData(prev => ({ ...prev, payor: { ...prev.payor, [key]: value } }));
  };

  const updateItem = (id: string, key: keyof LineItem, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [key]: value } : item)
    }));
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: 'New Item',
      description: 'Item description',
      price: 0,
      qty: 1
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data?')) {
      setData({
        ...INITIAL_DATA,
        client: { ...INITIAL_DATA.client },
        payor: { ...INITIAL_DATA.payor },
        items: INITIAL_DATA.items.map(item => ({ ...item })),
        terms: [...INITIAL_DATA.terms],
        logo: undefined 
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    
    // @ts-ignore - html2pdf is loaded via script tag
    const html2pdf = window.html2pdf;
    
    if (!html2pdf) {
      alert("PDF generator is still loading, please try again in a second.");
      return;
    }

    const opt = {
      margin: 0,
      filename: `invoice-${data.invoiceNo.replace('#', '')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(invoiceRef.current).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please use the Print option instead.");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex justify-center items-start gap-4">
      <div 
        ref={invoiceRef}
        className="bg-white w-full max-w-[850px] shadow-2xl rounded-sm p-12 relative print:p-0 print:shadow-none print:m-0 print:max-w-none"
      >
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <div 
              className="relative group cursor-pointer flex items-center gap-3 p-2 -m-2 border border-transparent hover:border-blue-200 hover:bg-blue-50/30 rounded transition-all min-w-[200px]"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload brand logo or banner"
            >
              {data.logo ? (
                <img src={data.logo} alt="Brand Logo" className="max-h-16 max-w-[300px] object-contain" />
              ) : (
                <>
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: DEFAULT_LOGO_SVG }} />
                  </div>
                  <Editable 
                    value={data.companyName} 
                    onChange={(val) => setData(p => ({ ...p, companyName: val }))} 
                    className="font-black text-xl tracking-tight text-slate-900" 
                    onClick={(e) => e.stopPropagation()}
                  />
                </>
              )}
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all no-print rounded">
                <div className="bg-white/90 px-3 py-1 rounded shadow-sm text-xs font-bold text-slate-500 border border-slate-200">
                  <i className="fa-solid fa-camera mr-2"></i> CHANGE BRANDING
                </div>
              </div>
              
              {data.logo && (
                <button 
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity no-print z-10 shadow-sm"
                >
                  <i className="fa-solid fa-x"></i>
                </button>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>
          
          <h1 className="text-7xl font-light text-slate-800 tracking-[0.05em]">INVOICE</h1>
        </div>

        {/* Separator Bar & Metadata Row - Reduced bottom margin to mb-3 */}
        <div className="flex items-center justify-between gap-6 mb-3">
          <div className="flex-grow h-[7px] bg-slate-100/80 rounded-full"></div>
          
          <div className="flex items-center gap-8 text-[15px] shrink-0">
             <div className="flex items-center gap-2">
                <span className="text-slate-400 font-normal">Invoice No:</span>
                <Editable value={data.invoiceNo} onChange={(val) => setData(p => ({ ...p, invoiceNo: val }))} className="font-bold text-slate-900" />
             </div>
             <div className="flex items-center gap-2">
                <span className="text-slate-400 font-normal">Date:</span>
                <Editable value={data.date} onChange={(val) => setData(p => ({ ...p, date: val }))} className="font-bold text-slate-900" />
             </div>
          </div>
        </div>

        {/* Addresses - Reduced bottom margin to mb-4 */}
        <div className="grid grid-cols-2 gap-24 mb-4 px-2">
          <div>
            <h3 className="font-bold text-slate-800 mb-2">Invoice To:</h3>
            <div className="text-slate-500 space-y-0.5 text-[15px]">
              <Editable value={data.client.name} onChange={(v) => updateClient('name', v)} className="font-semibold text-slate-700" />
              <Editable value={data.client.address} onChange={(v) => updateClient('address', v)} />
              <Editable value={data.client.cityStateZip} onChange={(v) => updateClient('cityStateZip', v)} />
              <Editable value={data.client.email} onChange={(v) => updateClient('email', v)} />
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-slate-800 mb-2">Pay To:</h3>
            <div className="text-slate-500 space-y-0.5 text-[15px]">
              <Editable value={data.payor.name} onChange={(v) => updatePayor('name', v)} className="font-semibold text-slate-700" />
              <Editable value={data.payor.address} onChange={(v) => updatePayor('address', v)} />
              <Editable value={data.payor.cityStateZip} onChange={(v) => updatePayor('cityStateZip', v)} />
              <Editable value={data.payor.email} onChange={(v) => updatePayor('email', v)} />
            </div>
          </div>
        </div>

        {/* Table - Reduced bottom margin to mb-4 */}
        <div className="mb-4">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-[#f8faff] text-slate-800 text-[14px] font-bold">
                <th className="py-2.5 px-4 border border-slate-200">Item</th>
                <th className="py-2.5 px-4 border border-slate-200">Description</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center">Price</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center">Qty</th>
                <th className="py-2.5 px-4 border border-slate-200 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="py-3 px-4 border border-slate-200 font-medium text-slate-700 align-top">
                    <div className="flex gap-2">
                      <span className="text-slate-400 font-normal">{index + 1}.</span>
                      <Editable value={item.name} onChange={(v) => updateItem(item.id, 'name', v)} />
                    </div>
                  </td>
                  <td className="py-3 px-4 border border-slate-200 text-slate-500 text-[14px] align-top w-1/3 leading-relaxed">
                    <Editable value={item.description} onChange={(v) => updateItem(item.id, 'description', v)} multiline />
                  </td>
                  <td className="py-3 px-4 border border-slate-200 text-slate-700 text-center font-medium align-top">
                    <div className="inline-flex items-center gap-1">
                      <span>$</span>
                      <Editable 
                        value={item.price} 
                        type="number" 
                        onChange={(v) => updateItem(item.id, 'price', parseFloat(v) || 0)} 
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 border border-slate-200 text-slate-700 text-center font-medium align-top">
                    <Editable 
                      value={item.qty} 
                      type="number" 
                      onChange={(v) => updateItem(item.id, 'qty', parseInt(v) || 0)} 
                    />
                  </td>
                  <td className="py-3 px-4 border border-slate-200 text-slate-900 text-right font-bold align-top relative">
                    ${(item.price * item.qty).toFixed(2)}
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all no-print"
                      title="Remove Item"
                    >
                      <i className="fa-solid fa-circle-minus"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            onClick={addItem}
            className="mt-2 text-blue-500 text-sm font-medium hover:text-blue-700 flex items-center gap-2 no-print transition-colors"
          >
            <i className="fa-solid fa-plus-circle"></i> Add New Item
          </button>
        </div>

        {/* Footer Info & Totals - Reduced bottom margin to mb-4 */}
        <div className="grid grid-cols-2 gap-12 mb-4">
          <div className="px-2">
            <h3 className="font-bold text-slate-800 mb-2">Payment Info:</h3>
            <div className="text-slate-500 space-y-0.5 text-[15px]">
              <Editable value={data.paymentMethod} onChange={(v) => setData(p => ({ ...p, paymentMethod: v }))} />
              <div className="flex items-center gap-2">
                <span>Amount:</span>
                <span className="font-bold text-slate-800">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 px-6">
            <div className="flex justify-between items-center text-[15px]">
              <span className="font-bold text-slate-800">SubTotal</span>
              <span className="font-bold text-slate-900">${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <div className="flex items-center gap-1 text-slate-400">
                <span>Tax</span>
                <span className="text-[12px] flex items-center">
                  (<Editable 
                    value={data.taxRate} 
                    type="number" 
                    onChange={(v) => setData(p => ({ ...p, taxRate: parseFloat(v) || 0 }))} 
                    className="w-8 inline-block"
                  />%)
                </span>
              </div>
              <span className="text-slate-500 font-medium">+ ${taxAmount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-200 w-full my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800">Grand Total</span>
              <span className="text-2xl font-black text-slate-900">${grandTotal.toFixed(2)}</span>
            </div>
            <div className="h-[1px] bg-slate-100 w-full"></div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-100 mx-2">
          <h3 className="font-bold text-slate-800 mb-2 text-sm">Terms & Conditions:</h3>
          <ul className="list-disc ml-4 space-y-1.5 text-[12px] text-slate-500 leading-relaxed">
            {data.terms.map((term, i) => (
              <li key={i}>
                <Editable 
                  value={term} 
                  onChange={(v) => {
                    const newTerms = [...data.terms];
                    newTerms[i] = v;
                    setData(p => ({ ...p, terms: newTerms }));
                  }} 
                  multiline 
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating Action Menu */}
      <div className="flex flex-col gap-3 sticky top-8 no-print z-50">
        <button 
          onClick={handlePrint}
          className="w-12 h-12 bg-white text-blue-500 rounded-lg shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all border border-blue-100 group"
          title="Print Invoice"
        >
          <i className="fa-solid fa-print group-hover:scale-110 transition-transform"></i>
        </button>
        <button 
          onClick={handleDownloadPdf}
          className="w-12 h-12 bg-green-500 text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-green-600 transition-all group"
          title="Download PDF"
        >
          <i className="fa-solid fa-cloud-arrow-down group-hover:-translate-y-1 transition-transform"></i>
        </button>
        <div className="w-12 h-[1px] bg-slate-200 my-2"></div>
        <button 
          onClick={handleReset}
          className="w-12 h-12 bg-white text-slate-400 rounded-lg shadow-sm flex items-center justify-center hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
          title="Reset"
        >
          <i className="fa-solid fa-rotate-right"></i>
        </button>
      </div>
    </div>
  );
};

export default App;
