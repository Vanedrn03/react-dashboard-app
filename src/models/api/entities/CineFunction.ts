import BaseEntity from '../core/_BaseEntity'
import type Movie from './Movie'
import type Hall from './Hall'

export default interface CineFunction extends BaseEntity {
  movie: Movie
  hall: Hall
  startTime: string
  price: number
}
