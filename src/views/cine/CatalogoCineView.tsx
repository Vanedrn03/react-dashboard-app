import {
  Button,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'
import type CineFunction from '@/models/api/entities/CineFunction'
import type Movie from '@/models/api/entities/Movie'
import type Hall from '@/models/api/entities/Hall'
import { queryKeys } from '@/lib/queryClient'
import { cineFunctionService, movieService, hallService } from '@/services/api'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export default function CatalogoCineView() {
  const [params, setParams] = useState({ page: 0, size: 10 })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CineFunction | null>(null)
  const [form] = Form.useForm()

  const { data: response, isLoading } = useFindAll<CineFunction>({
    queryKey: queryKeys.cineFunctions,
    service: cineFunctionService,
    queryParams: params,
  })

  const { data: moviesResponse } = useFindAll<Movie>({
    queryKey: queryKeys.movies,
    service: movieService,
    queryParams: { page: 0, size: 1000 },
  })

  const { data: hallsResponse } = useFindAll<Hall>({
    queryKey: queryKeys.halls,
    service: hallService,
    queryParams: { page: 0, size: 1000 },
  })

  const crud = useCrud<CineFunction>({
    service: cineFunctionService,
    queryKey: queryKeys.cineFunctions,
  })

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? prev.size,
    }))
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const parseDateValue = (v: unknown) => {
    if (!v) return undefined
    if (Array.isArray(v)) {
      const [year, month, day, hour = 0, min = 0] = v as number[]
      return dayjs(new Date(year, month - 1, day, hour, min))
    }
    return dayjs(String(v))
  }

  const openEdit = (fn: CineFunction) => {
    setEditing(fn)
    form.setFieldsValue({
      movieId: fn.movie?.id,
      hallId: fn.hall?.id,
      startTime: parseDateValue(fn.startTime),
      price: fn.price,
    })
    setOpen(true)
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    const payload = {
      ...values,
      startTime: values.startTime?.format('YYYY-MM-DDTHH:mm:ss'),
    }
    if (editing) {
      await crud.update({ id: editing.id!.toString(), payload })
    } else {
      await crud.create({ payload })
    }
    setOpen(false)
    form.resetFields()
  }

  const columns: ColumnsType<CineFunction> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Película', key: 'movie', render: (_, r) => r.movie?.title },
    { title: 'Sala', key: 'hall', render: (_, r) => r.hall?.name },
    {
      title: 'Inicio',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (v) => {
        if (!v) return '-'
        if (Array.isArray(v)) {
          const [year, month, day, hour = 0, min = 0] = v as number[]
          return dayjs(new Date(year, month - 1, day, hour, min)).format(
            'DD/MM/YYYY HH:mm'
          )
        }
        return dayjs(String(v)).format('DD/MM/YYYY HH:mm')
      },
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (v) => <Tag color="green">${v}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      render: (_text, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            Editar
          </Button>
          <Button
            type="link"
            danger
            onClick={() => crud.remove({ id: record.id! })}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ]

  const movieOptions = moviesResponse?.data?.map((m: Movie) => ({
    label: m.title,
    value: m.id,
  }))
  const hallOptions = hallsResponse?.data?.map((h: Hall) => ({
    label: h.name,
    value: h.id,
  }))

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button type="primary" onClick={openCreate}>
          Nueva función
        </Button>
      </div>
      <Table<CineFunction>
        columns={columns}
        dataSource={response?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: (response?.pagination.page ?? 0) + 1,
          pageSize: response?.pagination.pageSize,
          total: response?.pagination.total ?? 0,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        onChange={handleTableChange}
      />
      <Modal
        title={editing ? 'Editar función' : 'Nueva función'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="movieId"
            label="Película"
            rules={[{ required: true }]}
          >
            <Select options={movieOptions} placeholder="Seleccionar película" />
          </Form.Item>
          <Form.Item name="hallId" label="Sala" rules={[{ required: true }]}>
            <Select options={hallOptions} placeholder="Seleccionar sala" />
          </Form.Item>
          <Form.Item
            name="startTime"
            label="Fecha y hora de inicio"
            rules={[{ required: true }]}
          >
            <DatePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
          </Form.Item>
          <Form.Item name="price" label="Precio" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" prefix="$" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
