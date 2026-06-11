import { Button, Form, Input, InputNumber, Modal, Space, Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'
import type Hall from '@/models/api/entities/Hall'
import { queryKeys } from '@/lib/queryClient'
import { hallService } from '@/services/api'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'

export default function SalasView() {
  const [params, setParams] = useState({ page: 0, size: 10 })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Hall | null>(null)
  const [form] = Form.useForm()

  const { data: response, isLoading } = useFindAll<Hall>({
    queryKey: queryKeys.halls,
    service: hallService,
    queryParams: params,
  })

  const crud = useCrud<Hall>({
    service: hallService,
    queryKey: queryKeys.halls,
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

  const openEdit = (hall: Hall) => {
    setEditing(hall)
    form.setFieldsValue(hall)
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

  const columns: ColumnsType<Hall> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Capacidad',
      dataIndex: 'capacity',
      key: 'capacity',
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
          Nueva sala
        </Button>
      </div>
      <Table<Hall>
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
        title={editing ? 'Editar sala' : 'Nueva sala'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="capacity" label="Capacidad">
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
