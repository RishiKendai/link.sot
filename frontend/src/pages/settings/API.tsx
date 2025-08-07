import React, { useState } from 'react'
import TextBox from '../../components/ui/inputs/TextBox'
import Button from '../../components/ui/button/Button'
import APIManagement from './APIManagement'
import { useApiMutation } from '../../hooks/useApiMutation'
import { toast } from 'sonner'
import Modal from '../../components/ui/Modal'
import { copyClipboard } from '../../utils/copyClipboard'
import IconTick from '../../components/ui/icons/IconTick'
import IconCopy from '../../components/ui/icons/IconCopy'
import type { ApiKeyType } from './types'

const API: React.FC = () => {

  const [apiCreation, setAPICreation] = useState({ label: '' })
  const [formError, setFormError] = useState<Record<string, string>>({})
  const [newAPIKey, setNewAPIKey] = useState<string>('');
  const [copyAPIKey, setCopyAPIKey] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const { mutate: createAPIKeyMutation } = useApiMutation<{ label: string }, ApiKeyType>(['create-api-key'])

  const createAPIKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (apiCreation.label === '') {
      setFormError({ label: 'API Key name is required' })
      return
    }
    setFormError({})
    console.log('createAPIKey', apiCreation)
    createAPIKeyMutation({
      path: '/settings/api', // update this path to your actual API endpoint
      method: 'POST',
      payload: apiCreation
    }, {
      onSuccess: (data) => {
        if (data.status === 'success' && data.data) {

          setAPICreation({ label: '' })
          console.log('data success :::: ', data)
          setNewAPIKey(data.data.api_key)
          setShowSuccessModal(true)
        } else if (data.status === 'error') {
          toast.error("Failed to create API Key")
          console.error('Failed to create API Key:: ', data.error)
        }
      },
      onError: (err: unknown) => {
        console.log('err :::: ', err)
        toast.error('Failed to create API Key')
      }
    })
  }


  return (
    <>
      <div className='px-6 space-y-12'>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">API Integration</h1>
          <p className="text-gray-600 mb-4">Manage your API keys and settings here.</p>
        </div>
        {/* API Creation */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create API Key</h2>
          <form onSubmit={createAPIKey} className="space-y-4 flex flex-col">
            <TextBox
              placeholder="API Key Name"
              id='api-key-name'
              name='api-key-name'
              label='API Key Name'
              required={true}
              value={apiCreation.label}
              error={formError.label}
              onChange={(e) => setAPICreation({ ...apiCreation, label: e.target.value })}
            />
            <Button type='submit' variant='primary' label='Create API Key' className='mt-4 ml-auto' />
          </form>
        </div>
        {/* API Keys Management */}
        <APIManagement />
      </div>
      {/* Modal on success */}
      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <h2 className="text-xl font-semibold mb-4">API Key Created</h2>
        <div className="space-y-3">
          <p className="text-gray-700">Here is your new API key. Make sure to copy and save it somewhere secure.</p>
          <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm flex justify-between items-center">
            <span className="truncate">{newAPIKey}</span>
            <button type='button'
              onClick={() => {
                copyClipboard(newAPIKey)
                setCopyAPIKey(true)
                setTimeout(() => setCopyAPIKey(false), 2000)
              }}
              className="ml-4 cursor-pointer text-blue-600 font-semibold hover:underline"
            >
              {copyAPIKey ? (
                <IconTick size={18} />
              ) : (
                <IconCopy size={18} />
              )}
            </button>
          </div>
          <p className="text-sm text-red-500 mt-2">You won't be able to view this API key again for security reasons.</p>
        </div>
      </Modal>
    </>
  )
}

export default API