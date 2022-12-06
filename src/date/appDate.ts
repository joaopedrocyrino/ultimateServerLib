import moment from 'moment'

class AppDate {
    static isoDate (date?: string | number) {
        return moment(date).toISOString()
    }
}

export default AppDate
