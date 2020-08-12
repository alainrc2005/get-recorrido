import Dexie from 'dexie'

const db = new Dexie('getcoord')
db.version(1).stores({
  points: '++id,date,latitude,longitude,label'
})

export async function putLocation (coord) {
  return db.points.put(coord).then((id) => {
    return id
  }).catch(_ => {
    return -1
  })
}

export async function getLocationsByDate (startDate, endDate) {
  return await db.points.where('date').between(startDate, endDate).sortBy('date')
}

export function removeLocation (id) {
  return db.points.delete(id)
}

export default db
