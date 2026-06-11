import { Button, Form, Input, InputNumber, Modal, Space, Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'
import type Movie from '@/models/api/entities/Movie'
import { queryKeys } from '@/lib/queryClient'
import { movieService } from '@/services/api'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'

export default function PeliculasView() {
  const [params, setParams] = useState({ page: 0, size: 10 })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Movie | null>(null)
  const [form] = Form.useForm()

  const { data: response, isLoading } = useFindAll<Movie>({
    queryKey: queryKeys.movies,
    service: movieService,
    queryParams: params,
  })

  const crud = useCrud<Movie>({
    service: movieService,
    queryKey: queryKeys.movies,
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

  const openEdit = (movie: Movie) => {
    setEditing(movie)
    form.setFieldsValue(movie)
    setOpen(true)
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    if (editing) {
      await crud.update({ id: editing.id!.toString(), payload: values })
    } else {
      await crud.create({ payload: values })
    }
    setOpen(false)
    form.resetFields()
  }

  const columns: ColumnsType<Movie> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Título', dataIndex: 'title', key: 'title' },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
    {
      title: 'Duración (min)',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center',
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

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button type="primary" onClick={openCreate}>
          Nueva película
        </Button>
      </div>
      <Table<Movie>
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
        title={editing ? 'Editar película' : 'Nueva película'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Título" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="duration" label="Duración (minutos)">
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
