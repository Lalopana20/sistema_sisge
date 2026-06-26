import { useState, useCallback, useEffect } from 'react'
import {
  Card, Upload, Button, Steps, Table, Tag, Alert, Typography,
  Select, Space, Row, Col, Divider, Progress,
  Result, Collapse, Spin,
} from 'antd'
import {
  UploadOutlined, FileExcelOutlined, FilePdfOutlined,
  FileWordOutlined, CheckCircleOutlined, CloseCircleOutlined,
  InfoCircleOutlined, ReloadOutlined, EyeOutlined,
  DatabaseOutlined, WarningOutlined, ArrowRightOutlined,
} from '@ant-design/icons'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'

const { Title, Text } = Typography
const { Dragger } = Upload

// ── Iconos por extensión ──────────────────────────────────────────────────────
const ICONOS_EXT = {
  xlsx: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 32 }} />,
  xls:  <FileExcelOutlined style={{ color: '#52c41a', fontSize: 32 }} />,
  pdf:  <FilePdfOutlined   style={{ color: '#ff4d4f', fontSize: 32 }} />,
  docx: <FileWordOutlined  style={{ color: '#1890ff', fontSize: 32 }} />,
}

const TABLA_LABELS = {
  productos:   { label: 'Productos',   color: 'blue'   },
  categorias:  { label: 'Categorías',  color: 'purple' },
  movimientos: { label: 'Movimientos', color: 'orange' },
}

// ── Columnas de la tabla de resultados ───────────────────────────────────────
const colsPreview = (headers) =>
  headers.slice(0, 6).map((h) => ({
    title: h,
    dataIndex: h,
    key: h,
    ellipsis: true,
    width: 140,
    render: (v) => v !== null && v !== undefined ? String(v) : <Text type="secondary">—</Text>,
  }))

export default function ImportarDatos() {
  const [paso,        setPaso]        = useState(0)   // 0=subir 1=preview 2=resultado
  const [archivo,     setArchivo]     = useState(null) // File object
  const [preview,     setPreview]     = useState([])   // hojas detectadas
  const [resultado,   setResultado]   = useState([])   // resultado final
  const [cargando,    setCargando]    = useState(false)
  const [tablaManual, setTablaManual] = useState({})   // { hojaIdx: tabla }
  const [tablasSop,   setTablasSop]   = useState([])   // tablas soportadas

  // Cargar tablas soportadas al montar — useEffect, no useState
  useEffect(() => {
    api.get('/importar/tablas')
      .then(r => setTablasSop(r.data || []))
      .catch(() => {})
  }, [])

  // ── Paso 1: Subir y previsualizar ─────────────────────────────────────────
  const subirPreview = useCallback(async (file) => {
    setArchivo(file)
    setCargando(true)
    try {
      const form = new FormData()
      form.append('archivo', file)
      const { data } = await api.post('/importar/preview', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreview(data)
      setPaso(1)
    } catch (err) {
      notify.error('Error al analizar', getApiError(err, 'No se pudo leer el archivo'))
    } finally {
      setCargando(false)
    }
  }, [])

  // ── Paso 2: Confirmar e importar ──────────────────────────────────────────
  const confirmarImportacion = useCallback(async () => {
    const ok = await notify.confirm({
      title: '¿Confirmar importación?',
      content: `Se insertarán los datos de "${archivo?.name}" en la base de datos. Esta acción no se puede deshacer fácilmente.`,
      okText: 'Sí, importar',
      tipo: 'warning',
    })
    if (!ok) return

    setCargando(true)
    try {
      const form = new FormData()
      form.append('archivo', archivo)

      // Si el usuario cambió alguna tabla manualmente, enviar la primera
      const tablaForzada = Object.values(tablaManual)[0] || null
      if (tablaForzada) form.append('tabla', tablaForzada)

      const { data } = await api.post('/importar/procesar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResultado(data)
      setPaso(2)

      const total = data.reduce((s, r) => s + (r.insertados || 0), 0)
      notify.success('Importación completada', `${total} registro(s) importados correctamente`)
    } catch (err) {
      notify.error('Error en importación', getApiError(err, 'Falló la importación'))
    } finally {
      setCargando(false)
    }
  }, [archivo, tablaManual])

  const reiniciar = () => {
    setPaso(0); setArchivo(null); setPreview([])
    setResultado([]); setTablaManual({})
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div>
      <BackendStatusBanner />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <DatabaseOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Importar datos
          </Title>
          <Text type="secondary">
            Carga masiva desde Excel (.xlsx), PDF o Word (.docx). El sistema detecta automáticamente la tabla destino.
          </Text>
        </div>
        {paso > 0 && (
          <Button icon={<ReloadOutlined />} onClick={reiniciar}>
            Nueva importación
          </Button>
        )}
      </div>

      {/* ── Pasos ─────────────────────────────────────────────────────────── */}
      <Steps
        current={paso}
        style={{ marginBottom: 28 }}
        items={[
          { title: 'Seleccionar archivo', description: 'Excel, PDF o Word' },
          { title: 'Revisar datos',       description: 'Confirmar mapeo' },
          { title: 'Resultado',           description: 'Registros importados' },
        ]}
      />

      {/* ══════════════════════════════════════════════════════════════════
          PASO 0 — Zona de carga
      ══════════════════════════════════════════════════════════════════ */}
      {paso === 0 && (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="card-chart">
              <Spin spinning={cargando} tip="Analizando archivo...">
                <Dragger
                  name="archivo"
                  multiple={false}
                  accept=".xlsx,.xls,.pdf,.docx"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    subirPreview(file)
                    return false // evitar upload automático de antd
                  }}
                  style={{ padding: '24px 0' }}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 600 }}>
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="ant-upload-hint" style={{ color: '#888' }}>
                    Formatos soportados: <strong>.xlsx</strong>, <strong>.xls</strong>,{' '}
                    <strong>.pdf</strong>, <strong>.docx</strong> — Máximo 10 MB
                  </p>
                </Dragger>
              </Spin>
            </Card>
          </Col>

          {/* Panel de ayuda */}
          <Col xs={24} lg={8}>
            <Card title={<><InfoCircleOutlined style={{ color: '#1890ff' }} /> Guía de formato</>} className="card-chart">
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                {[
                  {
                    icon: ICONOS_EXT.xlsx,
                    titulo: 'Excel (.xlsx / .xls)',
                    desc: 'La primera fila debe ser el encabezado. Cada hoja se procesa por separado.',
                    ejemplo: 'nombre | stock_actual | id_categoria',
                  },
                  {
                    icon: ICONOS_EXT.pdf,
                    titulo: 'PDF',
                    desc: 'Debe contener una tabla con columnas separadas. Se extrae el texto automáticamente.',
                    ejemplo: 'Tablas con columnas alineadas o separadas por espacios',
                  },
                  {
                    icon: ICONOS_EXT.docx,
                    titulo: 'Word (.docx)',
                    desc: 'Inserta una tabla de Word con encabezados en la primera fila.',
                    ejemplo: 'Tabla de Word con fila de encabezados',
                  },
                ].map((item) => (
                  <div key={item.titulo} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                    <div>
                      <Text strong style={{ display: 'block' }}>{item.titulo}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                      <div style={{
                        marginTop: 4, background: '#f5f5f5', borderRadius: 4,
                        padding: '2px 8px', fontSize: 11, fontFamily: 'monospace',
                      }}>
                        {item.ejemplo}
                      </div>
                    </div>
                  </div>
                ))}

                <Divider style={{ margin: '8px 0' }} />

                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>
                    Tablas destino disponibles:
                  </Text>
                  {tablasSop.map(t => (
                    <div key={t.key} style={{ marginBottom: 6 }}>
                      <Tag color={TABLA_LABELS[t.key]?.color || 'default'}>{t.label}</Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {t.requeridos.join(', ')} (requeridos)
                      </Text>
                    </div>
                  ))}
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PASO 1 — Vista previa y confirmación
      ══════════════════════════════════════════════════════════════════ */}
      {paso === 1 && (
        <div>
          {/* Cabecera del archivo */}
          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Space>
              {ICONOS_EXT[archivo?.name?.split('.').pop()?.toLowerCase()] || <FileExcelOutlined style={{ fontSize: 28 }} />}
              <div>
                <Text strong style={{ fontSize: 15 }}>{archivo?.name}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  {(archivo?.size / 1024).toFixed(1)} KB — {preview.length} hoja(s) detectada(s)
                </Text>
              </div>
            </Space>
          </Card>

          {/* Una card por hoja */}
          {preview.map((hoja, idx) => (
            <Card
              key={idx}
              style={{ marginBottom: 16, borderRadius: 12 }}
              title={
                <Space>
                  <EyeOutlined />
                  <Text strong>Hoja: {hoja.hoja}</Text>
                  <Tag>{hoja.filas} fila(s)</Tag>
                  {hoja.tablaDetectada
                    ? <Tag color={TABLA_LABELS[hoja.tablaDetectada]?.color || 'blue'}>
                        <DatabaseOutlined /> → {TABLA_LABELS[hoja.tablaDetectada]?.label || hoja.tablaDetectada}
                      </Tag>
                    : <Tag color="warning"><WarningOutlined /> Sin tabla detectada</Tag>
                  }
                </Space>
              }
              extra={
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tabla destino:</Text>
                  <Select
                    size="small"
                    style={{ width: 160 }}
                    value={tablaManual[idx] ?? hoja.tablaDetectada ?? undefined}
                    placeholder="Seleccionar tabla"
                    onChange={(v) => setTablaManual(prev => ({ ...prev, [idx]: v }))}
                    options={tablasSop.map(t => ({ value: t.key, label: t.label }))}
                    allowClear
                  />
                </Space>
              }
            >
              {/* Mapeo de columnas detectado */}
              {hoja.tablaDetectada && Object.keys(hoja.mapeoSugerido || {}).length > 0 && (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12, borderRadius: 8 }}
                  message={
                    <span>
                      Mapeo detectado automáticamente:{' '}
                      {Object.entries(hoja.mapeoSugerido).map(([campo, col]) => (
                        <Tag key={campo} style={{ marginRight: 4 }}>
                          <Text code style={{ fontSize: 11 }}>{col}</Text>
                          <ArrowRightOutlined style={{ margin: '0 3px', fontSize: 10 }} />
                          <Text strong style={{ fontSize: 11 }}>{campo}</Text>
                        </Tag>
                      ))}
                    </span>
                  }
                />
              )}

              {!hoja.tablaDetectada && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 12, borderRadius: 8 }}
                  message="No se detectó la tabla destino automáticamente. Selecciona una tabla en el selector de arriba."
                />
              )}

              {/* Preview de datos */}
              <Table
                dataSource={hoja.preview.map((r, i) => ({ ...r, _key: i }))}
                columns={colsPreview(hoja.headers)}
                rowKey="_key"
                pagination={false}
                size="small"
                scroll={{ x: true }}
                bordered
                caption={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Mostrando {hoja.preview.length} de {hoja.filas} filas
                  </Text>
                }
              />
            </Card>
          ))}

          {/* Botones de acción */}
          <Card style={{ borderRadius: 12 }}>
            <Space>
              <Button onClick={reiniciar}>Cancelar</Button>
              <Button
                type="primary"
                icon={<DatabaseOutlined />}
                loading={cargando}
                onClick={confirmarImportacion}
                disabled={preview.every(h => !h.tablaDetectada && !tablaManual[preview.indexOf(h)])}
              >
                Importar {preview.reduce((s, h) => s + h.filas, 0)} registro(s)
              </Button>
            </Space>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PASO 2 — Resultado final
      ══════════════════════════════════════════════════════════════════ */}
      {paso === 2 && (
        <div>
          {/* Resumen global */}
          {(() => {
            const totalIns = resultado.reduce((s, r) => s + (r.insertados || 0), 0)
            const totalErr = resultado.reduce((s, r) => s + (r.errores?.length || 0), 0)
            const totalOmi = resultado.reduce((s, r) => s + (r.omitidos || 0), 0)
            const total    = resultado.reduce((s, r) => s + (r.filas || 0), 0)
            const pct      = total > 0 ? Math.round((totalIns / total) * 100) : 0

            return (
              <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <Row gutter={[24, 16]} align="middle">
                  <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                    {totalErr === 0
                      ? <Result status="success" title={`${totalIns} registros importados`} subTitle="Sin errores" style={{ padding: '16px 0' }} />
                      : <Result status="warning" title={`${totalIns} importados, ${totalErr} con error`} style={{ padding: '16px 0' }} />
                    }
                  </Col>
                  <Col xs={24} md={16}>
                    <Row gutter={[16, 8]}>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{totalIns}</div>
                          <Text type="secondary">Insertados</Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 28, fontWeight: 700, color: '#fa8c16' }}>{totalOmi}</div>
                          <Text type="secondary">Omitidos</Text>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>{totalErr}</div>
                          <Text type="secondary">Errores</Text>
                        </div>
                      </Col>
                    </Row>
                    <Progress
                      percent={pct}
                      strokeColor={totalErr > 0 ? '#fa8c16' : '#52c41a'}
                      style={{ marginTop: 16 }}
                      format={(p) => `${p}% exitoso`}
                    />
                  </Col>
                </Row>
              </Card>
            )
          })()}

          {/* Detalle por hoja */}
          {resultado.map((r, idx) => (
            <Card
              key={idx}
              style={{ marginBottom: 12, borderRadius: 12 }}
              size="small"
              title={
                <Space>
                  {r.insertados > 0
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  }
                  <Text strong>{r.hoja}</Text>
                  {r.tabla && (
                    <Tag color={TABLA_LABELS[r.tabla]?.color || 'blue'}>
                      {TABLA_LABELS[r.tabla]?.label || r.tabla}
                    </Tag>
                  )}
                  <Tag color="green">{r.insertados} insertados</Tag>
                  {r.omitidos > 0 && <Tag color="orange">{r.omitidos} omitidos</Tag>}
                  {r.errores?.length > 0 && <Tag color="red">{r.errores.length} errores</Tag>}
                </Space>
              }
            >
              {r.errores?.length > 0 && (
                <Collapse
                  size="small"
                  ghost
                  items={[{
                    key: '1',
                    label: <Text type="danger">Ver {r.errores.length} error(es)</Text>,
                    children: (
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {r.errores.map((e, i) => (
                          <li key={i} style={{ fontSize: 12, color: '#ff4d4f', marginBottom: 2 }}>{e}</li>
                        ))}
                      </ul>
                    ),
                  }]}
                />
              )}
              {!r.tabla && (
                <Alert type="warning" showIcon message="Esta hoja no fue procesada (tabla no detectada)" style={{ borderRadius: 6 }} />
              )}
            </Card>
          ))}

          <Space style={{ marginTop: 8 }}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={reiniciar}>
              Importar otro archivo
            </Button>
          </Space>
        </div>
      )}
    </div>
  )
}
