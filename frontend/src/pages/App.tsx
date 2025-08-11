import Header from '../components/Header'

import './App.css'
import Footer from '../components/Footer'
import { useState } from 'react'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import IconLink from '../components/ui/icons/IconLink'
import IconAnalytics from '../components/ui/icons/IconAnalytics'
import IconShield from '../components/ui/icons/IconShield'
import TextBox from '../components/ui/inputs/TextBox'
import Button from '../components/ui/button/Button'

const features = [
  {
    title: "Custom Short Links",
    description: "Create memorable and branded short URLs. Fully customize the back-half to reflect your content.",
    icon: <IconLink className='feature-icon text-3xl mb-4' size={38} />,
  },
  {
    title: "Comprehensive Analytics",
    description: "Track every click: geo-location, device type, referrer, and more. Understand your audience like never before.",
    icon: <IconAnalytics className='feature-icon text-3xl mb-4' size={38} />,
  },
  {
    title: "Secure & Protected Links",
    description: "Keep your audience safe with built-in malicious URL scanning, optional password protection, and expiry dates.",
    icon: <IconShield className='feature-icon text-3xl mb-4' size={38} />,
  },
  // {
  //   title: "Clean & Intuitive Dashboard",
  //   description: "Manage all your links, view analytics, and access powerful tools through a beautifully designed, user-friendly interface.",
  //   icon: `<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>`
  // }
]

type modalState = 'login' | 'register' | null

function App() {

  const [modalOpen, setModalOpen] = useState<modalState>(null)
  const [heroLink, setHeroLink] = useState<string>('')
  const [error, setError] = useState<Record<string, string>>({})

  const handleModal = (state: modalState) => {
    if (state === 'login') {
      setModalOpen('login')
    } else if (state === 'register') {
      setModalOpen('register')
    } else {
      setModalOpen(null)
    }
  }

  const ShortenLink = () => {
    if (!heroLink) {
      setError(prev => ({
        ...prev,
        heroLink: 'Please enter a link to shorten.'
      }))
      return
    }
    setError(prev => ({
      ...prev,
      heroLink: ''
    }))
    handleModal('register')
  }

  return (
    <>
      {modalOpen === 'login' && <LoginModal handleModal={handleModal} heroLink={heroLink} />}
      {modalOpen === 'register' && <RegisterModal handleModal={handleModal} heroLink={heroLink} />}

      <div className='flex w-full min-h-dvh flex-col justify-center'>
        <Header handleModal={handleModal} />
        {/* Hero Section */}
        <section className='flex flex-col pt-28 pb-20 px-2 items-center justify-center relative min-h-screen-75'>
          <div className='mx-auto text-center'>
            <h1 className='text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6'>
              <span className="txt-gradient">Shorten. Track. Elevate.</span>
              <br className="hidden sm:block" />
              Your Links, Mastered.</h1>
            <p className="hero-subtitle text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto">
              Transform long URLs into powerful, trackable short links. Gain insights, protect your audience, and boost your reach with LinkSot.
            </p>
          </div>
          {/* Quick shorten Input */}
          <div className='mx-auto'>
            <h3 className="text-lg text-center font-semibold text-gray-800 mb-4">Try it now!</h3>
            <div className='flex flex-col sm:flex-row gap-4'>
              <TextBox
                id='heroShortenInput'
                wrapperClass='flex-grow'
                className='text-lg'
                placeholder='Paste your long URL here...'
                type='url'
                onChange={(e) => setHeroLink(e.target.value)}
                value={heroLink}
                error={error.heroLink}
              />
              <Button label='Shorten' className='gpb self-start text-xl' onClick={ShortenLink} />
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Beyond Basic Link Shortening
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              LinkSot empowers you with robust features designed for modern digital campaigns and content sharing.
            </p>
          </div>
          <div className="max-w-6xl   mx-auto feature-cards flex flex-wrap gap-4 justify-center md:justify-between items-center">
            {
              features.map((feature, index) => (
                <div key={index} className="feature-card group rounded-lg select-none">
                  {/* card top */}
                  <div className='bg-white face-1 shadow-xl hover:shadow-none h-[200px] w-[300px] relative z-2 duration-[0.5s] translate-y-[100px] group-hover:translate-y-0 flex flex-col items-center justify-center'>
                    {/* <div className="feature-icon text-3xl mb-4" dangerouslySetInnerHTML={{ __html: feature.icon }} /> */}
                    {feature.icon}
                    <h3 className="group-hover:text-white text-xl font-semibold mb-2">{feature.title}</h3>
                  </div>
                  {/* card bottom */}
                  <div className='bg-white group-hover:shadow-xl h-[200px] w-[300px] duration-[0.5s] -translate-y-[100px] group-hover:translate-y-0 p-5 flex items-center justify-center'>
                    <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center max-w-[90%]">{feature.description}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </section>
        {/* Call to Action Section */}
        <section className="pb-16 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto p-8 md:p-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Ready to Unleash the Power of Your Links?
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
              Say goodbye to basic links. With  LinkSot, you get real-time insights, smart targeting, and effortless control — right out of the box.
            </p>
            <button onClick={() => {
              setHeroLink('')
              setError({})
              handleModal('register')
            }} className="gpb btn-animate px-10 py-5 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl">
              <span className="text-white">Start Your  LinkSot Journey Free</span>
            </button>
          </div>
        </section>
        {/* Footer */}
        <Footer />
      </div>

    </>
  )
}

export default App
