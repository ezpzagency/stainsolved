interface MaterialInfo {
  properties: string;
  commonUses: string;
  careInstructions: string;
}

interface SidebarProps {
  materialInfo: MaterialInfo;
}

const Sidebar = ({ materialInfo }: SidebarProps) => {
  if (!materialInfo) {
    return null;
  }
  
  return (
    <aside className="mt-10 lg:mt-0">
      <div className="sticky top-24">
        <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
          <h3 className="font-bold text-slate-900 mb-3">Quick Navigation</h3>
          <ul className="space-y-2">
            <li>
              <a href="#supplies" className="text-sm text-slate-700 hover:text-primary flex items-center">
                <i className="ri-arrow-right-s-line mr-2"></i>
                Supplies Needed
              </a>
            </li>
            <li>
              <a href="#instructions" className="text-sm text-slate-700 hover:text-primary flex items-center">
                <i className="ri-arrow-right-s-line mr-2"></i>
                Step-by-Step Instructions
              </a>
            </li>
            <li>
              <a href="#warnings" className="text-sm text-slate-700 hover:text-primary flex items-center">
                <i className="ri-arrow-right-s-line mr-2"></i>
                Important Warnings
              </a>
            </li>
            <li>
              <a href="#effectiveness" className="text-sm text-slate-700 hover:text-primary flex items-center">
                <i className="ri-arrow-right-s-line mr-2"></i>
                Effectiveness & Results
              </a>
            </li>
            <li>
              <a href="#faq" className="text-sm text-slate-700 hover:text-primary flex items-center">
                <i className="ri-arrow-right-s-line mr-2"></i>
                FAQs
              </a>
            </li>
          </ul>
        </div>
        
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-5 mb-6">
          <h3 className="font-bold text-slate-900 mb-3">Materials Information</h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-slate-700">Material Properties</h4>
              <p className="text-sm text-slate-600">{materialInfo.properties}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700">Common Uses</h4>
              <p className="text-sm text-slate-600">{materialInfo.commonUses}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700">Care Instructions</h4>
              <p className="text-sm text-slate-600">{materialInfo.careInstructions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-primary/5 rounded-lg border border-primary/20 p-5">
          <h3 className="font-bold text-slate-900 mb-3">Save This Guide</h3>
          <p className="text-sm text-slate-700 mb-4">Never lose this guide. Save it for quick access when you need it most.</p>
          <div className="flex gap-2 mb-4">
            <button className="flex-1 bg-primary text-white py-2 rounded font-medium text-sm hover:bg-primary/90 transition-colors">
              Save Guide
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded hover:border-primary transition-colors">
              <i className="ri-printer-line text-slate-700"></i>
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex justify-center items-center gap-1 py-2 bg-white border border-slate-200 rounded font-medium text-sm text-slate-700 hover:border-slate-400 transition-colors">
              <i className="ri-facebook-fill text-blue-600"></i>
              Share
            </button>
            <button className="flex-1 flex justify-center items-center gap-1 py-2 bg-white border border-slate-200 rounded font-medium text-sm text-slate-700 hover:border-slate-400 transition-colors">
              <i className="ri-twitter-fill text-blue-400"></i>
              Tweet
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
