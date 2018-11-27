import fs from 'fs'
import { fetchStoriesWithCat } from '../utils'

export const categories = [
	{fileName: 'tien-hiep', category: 'Tiên Hiệp'},
	{fileName: 'kiem-hiep', category: 'Kiếm Hiệp'},
	{fileName: 'ngon-tinh', category: 'Ngôn Tình'},
	{fileName: 'do-thi', category: 'Đô Thị'},
	{fileName: 'quan-truong', category: 'Quan Trường'},
	{fileName: 'vong-du', category: 'Võng Du'},
	{fileName: 'khoa-huyen', category: 'Khoa Huyễn'},
	{fileName: 'huyen-huyen', category: 'Huyền Huyễn'},
	{fileName: 'di-gioi', category: 'Dị Giới'},
	{fileName: 'di-nang', category: 'Dị Năng'},
	{fileName: 'quan-su', category: 'Quân Sự'},
	{fileName: 'lich-su', category: 'Lịch Sử'},
	{fileName: 'xuyen-khong', category: 'Xuyên Không'},
	{fileName: 'trong-sinh', category: 'Trọng Sinh'},
	{fileName: 'trinh-tham', category: 'Trinh Thám'},
	{fileName: 'tham-hiem', category: 'Thám Hiểm'},
	{fileName: 'linh-di', category: 'Linh Dị'},
	{fileName: 'sac', category: 'Sắc'},
	{fileName: 'nguoc', category: 'Ngược'},
	{fileName: 'sung', category: 'Sủng'},
	{fileName: 'cung-dau', category: 'Cung Đấu'},
	{fileName: 'nu-cuong', category: 'Nữ Cường'},
	{fileName: 'gia-dau', category: 'Gia Đấu'},
	{fileName: 'dong-phuong', category: 'Đông Phương'},
	{fileName: 'dam-my', category: 'Đam Mỹ'},
	{fileName: 'bach-hop', category: 'Bách Hợp'},
	{fileName: 'hai-huoc', category: 'Hài Hước'},
	{fileName: 'dien-van', category: 'Điền Văn'},
	{fileName: 'co-dai', category: 'Cổ Đại'},
	{fileName: 'mat-the', category: 'Mạt Thế'},
	{fileName: 'truyen-teen', category: 'Truyện Teen'},
	{fileName: 'phuong-tay', category: 'Phương Tây'},
	{fileName: 'nu-phu', category: 'Nữ Phụ'},
	{fileName: 'light-novel', category: 'Light Novel'},
	{fileName: 'viet-nam', category: 'Việt Nam'},
	{fileName: 'doan-van', category: 'Đoản Văn'},
	{fileName: 'khac', category: 'Khác'}
]

export function writeToJson(category) {
	return new Promise(async (resolve, reject) => {
		const data = await fetchStoriesWithCat(category.category, 0)
		console.log(data)
		try {
			fs.writeFile(`./src/crawler/truyenfull/files/${category.fileName}.json`, JSON.stringify(data), (err) => {
				if (err) {
					return console.log(err)
				}
				console.log('file saved!')
				resolve('done')
			})
		}
		catch (e) {
			console.log('error while write file...', e)
			reject(e)
		}
	})
}

export async function saveCategoriesToFiles(cats) {
	for (let i = 0; i < cats.length; i ++ ) {
		await writeToJson(cats[i])
	}
	return
}