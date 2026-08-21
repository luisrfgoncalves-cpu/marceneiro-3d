// Hook para busca automática de dados da empresa pelo CNPJ (BrasilAPI)
import { useState } from 'react'

export interface EmpresaData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  municipio: string
  uf: string
}

export function useCnpj() {
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const buscarCnpj = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return
    setBuscando(true)
    setErro(null)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      if (!res.ok) throw new Error('CNPJ não encontrado')
      const data = await res.json()
      setEmpresa({
        cnpj: data.cnpj,
        razaoSocial: data.razao_social ?? '',
        nomeFantasia: data.nome_fantasia ?? data.razao_social ?? '',
        cep: data.cep ?? '',
        logradouro: data.logradouro ?? '',
        numero: data.numero ?? '',
        bairro: data.bairro ?? '',
        municipio: data.municipio ?? '',
        uf: data.uf ?? '',
      })
    } catch {
      setErro('CNPJ não encontrado ou inválido.')
      setEmpresa(null)
    } finally {
      setBuscando(false)
    }
  }

  return { empresa, buscando, erro, buscarCnpj, setEmpresa }
}
