import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (userError) throw userError

      setAuth({
        session: authData.session,
        role: userData.role,
        profileId: userData.id,
        accountId: userData.account_id,
      })

      if (userData.role === 'coach' || userData.role === 'admin') {
        const { data: coachData } = await supabase
          .from('coaches')
          .select('id')
          .eq('user_id', userData.user_id)
          .single()
        
        if (coachData) {
          setAuth({ coachId: coachData.id })
        }
        
        navigate('/coach/dashboard')
      } else {
        navigate('/client/home')
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">GymCoach</h1>
          <p className="text-zinc-400">Tu compañero de entrenamiento</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            
            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
