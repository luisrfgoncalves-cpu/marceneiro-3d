// Componente de PDF do Orçamento usando @react-pdf/renderer
// Roda 100% no celular, sem necessidade de servidor.

import {
  Document, Page, Text, View, StyleSheet
} from '@react-pdf/renderer'
import type { EnvironmentProject } from '../engine/environment'
import type { CustoDetalhado } from '../lib/exportUtils'

const R = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#1e293b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: '#d97706' },
  headerLeft: {},
  appName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#d97706' },
  appSub: { fontSize: 9, color: '#64748b', marginTop: 2 },
  clientInfo: { textAlign: 'right' },
  clientName: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  clientDetail: { fontSize: 9, color: '#64748b', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#d97706', textTransform: 'uppercase', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  row: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowEven: { backgroundColor: '#f8fafc' },
  cell: { fontSize: 9, color: '#334155' },
  cellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e293b' },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  col3: { flex: 1, textAlign: 'center' },
  costoBox: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 4, padding: 16, marginTop: 8 },
  costoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  costoLabel: { fontSize: 9, color: '#92400e' },
  costoValue: { fontSize: 9, color: '#92400e' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#fde68a' },
  totalLabel: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#78350f' },
  totalValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#d97706' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8' },
  assinatura: { marginTop: 40, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  assinLine: { borderBottomWidth: 1, borderBottomColor: '#334155', width: 220, marginTop: 30 },
  assinLabel: { fontSize: 8, color: '#64748b', marginTop: 4 },
})

interface BudgetDocProps {
  project: EnvironmentProject
  custo: CustoDetalhado
  nomeEmpresa?: string
  marceneiro?: string
}

export function BudgetDocument({ project, custo, nomeEmpresa = 'Marceneiro 3D', marceneiro }: BudgetDocProps) {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const AMBIENTE_LABEL: Record<string, string> = {
    cozinha: 'Cozinha', dormitorio: 'Dormitório', banheiro: 'Banheiro',
    area_servico: 'Área de Serviço', sala: 'Sala',
  }

  return (
    <Document title={`Orçamento — ${project.nome ?? 'Projeto'}`} author={nomeEmpresa}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>{nomeEmpresa}</Text>
            <Text style={styles.appSub}>Orçamento de Móveis Planejados</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{project.cliente ?? 'Cliente'}</Text>
            <Text style={styles.clientDetail}>Data: {hoje}</Text>
            <Text style={styles.clientDetail}>Ambiente: {AMBIENTE_LABEL[project.ambiente] ?? project.ambiente}</Text>
          </View>
        </View>

        {/* Módulos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Módulos do Projeto</Text>
          <View style={[styles.row, { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.col1, styles.cellBold, { color: '#fff' }]}>Módulo</Text>
            <Text style={[styles.col3, styles.cellBold, { color: '#fff' }]}>Dimensões (cm)</Text>
            <Text style={[styles.col2, styles.cellBold, { color: '#fff' }]}>Material</Text>
          </View>
          {project.modulos.map((m: import('../engine/environment').ModuleInstance, i: number) => (
            <View key={m.id} style={[styles.row, i % 2 === 0 ? styles.rowEven : {}]}>
              <Text style={[styles.col1, styles.cell]}>{m.config.nome ?? m.config.moduloTipo}</Text>
              <Text style={[styles.col3, styles.cell]}>
                {(m.config.largura/10).toFixed(0)}×{(m.config.altura/10).toFixed(0)}×{(m.config.profundidade/10).toFixed(0)}
              </Text>
              <Text style={[styles.col2, styles.cell]}>{m.config.materialExterno}</Text>
            </View>
          ))}
        </View>

        {/* Custo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
          <View style={styles.costoBox}>
            <View style={styles.costoRow}>
              <Text style={styles.costoLabel}>MDF / Chapas ({custo.mdf_m2} m²)</Text>
              <Text style={styles.costoValue}>{R(custo.custo_mdf)}</Text>
            </View>
            <View style={styles.costoRow}>
              <Text style={styles.costoLabel}>Ferragens e Acessórios</Text>
              <Text style={styles.costoValue}>{R(custo.custo_ferragens)}</Text>
            </View>
            <View style={styles.costoRow}>
              <Text style={styles.costoLabel}>Mão de obra estimada</Text>
              <Text style={styles.costoValue}>{R(custo.custo_servicos)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL DO ORÇAMENTO</Text>
              <Text style={styles.totalValue}>{R(custo.total)}</Text>
            </View>
          </View>
        </View>

        {/* Assinatura */}
        <View style={styles.assinatura}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>
            Este orçamento tem validade de 15 dias a partir de {hoje}. O projeto pode sofrer ajustes de acordo com a medição final do ambiente.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
            <View>
              <View style={styles.assinLine} />
              <Text style={styles.assinLabel}>{marceneiro ?? nomeEmpresa}</Text>
              <Text style={styles.assinLabel}>Responsável Técnico</Text>
            </View>
            <View>
              <View style={styles.assinLine} />
              <Text style={styles.assinLabel}>{project.cliente ?? 'Cliente'}</Text>
              <Text style={styles.assinLabel}>De acordo</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Gerado por Marceneiro 3D — {hoje} — Página 1
        </Text>
      </Page>
    </Document>
  )
}
