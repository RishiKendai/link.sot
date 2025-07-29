function Footer() {
  return (
      <footer className="bg-gray-800 text-gray-400 py-10 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center text-center">
              <div className="mb-4 md:mb-0">
                  <p>&copy; 2025 LinkSot. All rights reserved.</p>
                  <p className="text-sm mt-2">Passion-built. Purpose-driven.</p>
              </div>
              {/* <div className="flex space-x-6">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Support</a>
              </div> */}
          </div>
      </footer>  )
}

export default Footer