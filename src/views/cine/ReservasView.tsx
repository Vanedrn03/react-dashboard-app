import { Button, Form, InputNumber, Modal, Select, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import type Reservation from '@/models/api/entities/Reservation'
import type CineFunction from '@/models/api/entities/CineFunction'
import { queryKeys } from '@/lib/queryClient'
import { reservationService, cineFunctionService } from '@/services/api'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import dayjs from 'dayjs'

export default function ReservasView() {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: functionsResponse } = useFindAll<CineFunction>({
    queryKey: queryKeys.cineFunctions,
    service: cineFunctionService,
    queryParams: { page: 0, size: 1000 },
  })

  const crud = useCrud<Reservation>({
    service: reservationService,
    queryKey: queryKeys.reservations,
  })

  const handleOk = async () => {
    const values = await form.validateFields()
    await crud.create({ payload: values })
    setOpen(false)
    form.resetFields()
  }

  const parseDateValue = (v: unknown) => {
    if (!v) return undefined
    if (Array.isArray(v)) {
      const [year, month, day, hour = 0, min = 0] = v as number[]
      return dayjs(new Date(year, month - 1, day, hour, min))
    }
    return dayjs(String(v))
  }

  const functionOptions = functionsResponse?.data?.map((f: CineFunction) => ({
    label: `${f.movie?.title} - ${f.hall?.name} - ${f.startTime ? parseDateValue(f.startTime)?.format('DD/MM/YYYY HH:mm') : ''}`,
    value: f.id,
  }))

  const columns: ColumnsType<Reservation> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    {
      title: 'Película',
      key: 'movie',
      render: (_, r) => r.function?.movie?.title,
    },
    { title: 'Sala', key: 'hall', render: (_, r) => r.function?.hall?.name },
    {
      title: 'Función',
      key: 'startTime',
      render: (_, r) =>
        parseDateValue(r.function?.startTime)?.format('DD/MM/YYYY HH:mm') ??
        '-',
    },
    {
      title: 'Entradas',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Fecha reserva',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
  ]

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button
          type="primary"
          onClick={() => {
            form.resetFields()
            setOpen(true)
          }}
        >
          Nueva reserva
        </Button>
      </div>
      <Table<Reservation>
        columns={columns}
        dataSource={[]}
        rowKey="id"
        pagination={{ position: ['bottomCenter'] }}
      />
      <Modal
        title="Nueva reserva"
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="functionId"
            label="Función"
            rules={[{ required: true }]}
          >
            <Select
              options={functionOptions}
              placeholder="Seleccionar función"
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Cantidad de entradas"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
