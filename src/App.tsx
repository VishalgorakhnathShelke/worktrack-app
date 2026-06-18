import { useEffect, useState } from 'react'

export default function App() {
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    window.api.getAppVersion().then(setVersion)
  }, [])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-neutral-900 text-neutral-50">
      <h1 className="text-3xl font-bold">⚡ Electron + React</h1>
      <p className="text-neutral-400">{version ? `v${version}` : 'Loading…'}</p>
    </div>
  )
}
