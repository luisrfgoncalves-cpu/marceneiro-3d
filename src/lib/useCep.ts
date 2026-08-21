// Hook para busca automática de endereço pelo CEP (BrasilAPI)
// Uso: const { endereco, buscando, buscarCep } = useCep()
import { useState } from 'react'

export interface Endereco {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
}

export function useCep() {
  const [endereco, setEndereco] = useState<Endereco | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setBuscando(true)
    setErro(null)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`)
      if (!res.ok) throw new Error('CEP não encontrado')
      const data = await res.json()
      setEndereco({
        cep: data.cep,
        logradouro: data.street ?? '',
        complemento: '',
        bairro: data.neighborhood ?? '',
        localidade: data.city ?? '',
        uf: data.state ?? '',
      })
    } catch {
      setErro('CEP não encontrado. Verifique e tente novamente.')
      setEndereco(null)
    } finally {
      setBuscando(false)
    }
  }

  return { endereco, buscando, erro, buscarCep }
}
