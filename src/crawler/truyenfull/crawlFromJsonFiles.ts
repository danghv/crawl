import fs from 'fs'

export function readData(cat) {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile(`./src/crawler/truyenfull/files/${cat.fileName}.json`, (err, data: any) => {
				if (err) {
					console.log('e', err)
				}
				// console.log('data...', JSON.parse(data)[0])
				resolve(JSON.parse(data))
			})
		}
		catch (e) {
			reject(e)
		}
	})
}
