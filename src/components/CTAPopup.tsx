interface CTAPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CTAPopup({ isOpen, onClose }: CTAPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="glass bg-white/90 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/20 transform transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#3B3EAA] via-[#2F3295] to-[#5657D5] rounded-t-xl"></div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-[#2F3295]">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          Unlock Premium Features
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Thanks for beta testing our Workbrand Score™. Contact us for a full analysis or to learn more about we can work together.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://workbrandglobal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-[#2F3295] to-[#4E51C8] text-white py-3 px-4 rounded-lg text-center font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center"
          >
            <span className="text-white">Get Full Analysis</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-2 text-white">
              <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </a>
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 py-3 px-4 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors"
            style={{ color: "#2F3295" }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 