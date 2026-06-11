import BaseEntity from '../core/_BaseEntity'
import type CineFunction from './CineFunction'

export default interface Reservation extends BaseEntity {
  function: CineFunction
  quantity: number
  createdAt: string
}
