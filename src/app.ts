import express from 'express'
import graphqlHTTP from 'express-graphql'
import schema from './data/schema/schema'
import mongoose from 'mongoose'
import { StorySchema } from './data/models/story'

const testHTML = '<div class="chapter-c" style="font-size: 24px;">- Ưm, ta đang ở nơi nào thế này?<br><br>Lắc lư cái đầu vừa tỉnh lại sau khi chìm vào hôn mê, Lục Thiếu Du cảm thấy xung quanh mình rất ẩm ướt, hơn nữa toàn thân đau nhức như muốn tê liệt, gió từ bốn phía thổi qua, tạt vào người hắn khiến hắn không nhịn được mà rùng mình một cái.<br><br>Đầu Lục Thiếu Du toát mồ hôi lạnh, hắn vội vàng mở choàng mắt. Không gian xung quanh chỉ là một mảnh đen kịt, trên không trung, một vầng trăng lưỡi liềm đang treo lơ lửng. Sau một lát, mượn ánh sáng yếu ớt phát ra từ mặt trăng hắn mới nhìn được cảnh vật rõ ràng hơn một chút. Hiện tại hắn đang ở trong một đầm nước, lúc này hẳn là ban đêm.<br><br>- A...<br><br>Cơn đau điếng từ đại não truyền đến khiến hắn phải kêu lên một tiếng thảm thiết. Lục Thiếu Du cảm nhận được có một lực lượng kỳ lạ đánh vào đầu mình khiến hắn lập tức ngất đi một lần nữa.<br><br>Khi trời gần sáng Lục Thiếu Du mới từ từ tỉnh lại, nhưng khi nhận được tin tức mới từ đại não Lục Thiếu Du thiếu chút nữa lại ngất đi.<br><br>- Nhân phẩm của ta bạo phát sao, xuyên việt rồi, đây là không phải là nằm mơ chứ?<br><br>Lục Thiếu Du mở to hai mắt chăm chú nhìn bốn phía, theo những tin tức nhận được từ đại não, cùng với việc đã từng xem qua mấy tiểu thuyết xuyên việt, Lục Thiếu Du khẳng định rằng mình đã bị xuyên việt rồi. Tình huống này tưởng chừng như không có thật, thậm chí trong trăm triệu hoàn cảnh cũng chưa chắc tìm được một, vậy mà lại xảy ra trên người hắn.<br><br>Lục Thiếu Du ngẫm lại, mình vừa mới tốt nghiệp đại học hạng ba, cũng tìm được công việc vặt vãnh ở trong một văn phòng nhỏ. Trong khi đang giúp cấp trên photo tài liệu thì không ngờ máy photocopy bị rò điện, hắn bị chết bất đắc kỳ tử mà xuyên qua.<br><br>Kiếp trước không nói làm gì, tiền đồ xa vời, xuyên qua cũng tốt, nói không chừng xuyên qua đến một thế giới khác sẽ đạt được thành tựu lớn hơn. Dựa theo những hiểu biết của bản thân hắn trong tiểu thuyết, người xuyên qua, không một người nào đạt được thành tựu quá thấp. Nguyên một đám không phải thê thiếp thành đàn thì cũng là bá chủ của thế giới mới, kém cỏi nhất cũng làm phú nhị gia, hẳn là mình cũng không quá xui xẻo.<br><br>Xác định mình bị xuyên qua, Lục Thiếu Du không có bất kỳ cảm giác đau khổ hay tiếc nuối gì mà ngược lại hắn cảm thấy mình như được giải thoát. Kiếp trước hắn không phải là người có chức có quyền, cũng không phải người giàu có, tiền đồ rất xa vời, tương lai mờ mịt.<br><br>- Nơi này là chỗ nào, tại sao ta lại xuyên đến chỗ quỷ quái này?<br><br>Lục Thiếu Du đánh giá xung quanh, bắt đầu lục lọi ký ức còn lưu lại trong đầu, một đoạn ký ức không thuộc về hắn.<br><br>Sau một lát, Lục Thiếu Du có loại xúc động muốn tự sát để xem có thể xuyên qua lần nữa hay không. Người khác xuyên qua không phải thành thiếu gia thì cũng là Vương gia, không thì cũng anh tuấn tiêu sái, phong độ bức người, là công tử gia tộc hoặc thế lực lớn.<br><br>Mà thân thể hắn xuyên vào mặc dù ở thế giới này cũng là một thiếu gia nhưng lại hữu danh vô thực. Vị thiếu gia này cũng tên là Lục Thiếu Du, năm nay vừa mới mười sáu tuổi, là một người con riêng, địa vị của hắn trong gia tộc ngay cả người hầu đều không bằng. Ngoài ra hắn còn có một mẫu thân, trước là người hầu trong gia tộc, sau khi sinh hạ vị thiếu gia này thì càng bị vợ cả ức hiếp, cùng trải qua ngày tháng so với nô tài còn không bằng.<br><br>Hai mẫu thân con, ngày bình thường thì luôn bị người trong gia tộc ức hiếp, ngay cả nô bộc cũng không để họ vào mắt. Đặc biệt là mấy nha hoàn đi theo vợ cả, càng hay tìm cớ để làm nhục bọn họ.<br><br>Ngay như ngày hôm qua, chỉ vì chống đối vài câu mà vị thiếu gia này đã bị bọn chúng đánh cho một trận, nhưng không ngờ tới bị đánh đến chết. Đoán chừng những người kia thấy người bị chết mà sợ hãi nên mới đem vị thiếu gia này vất xuống vách núi, thi thể rơi vào đầm nước dưới vách núi, còn mình thì vì nhân phẩm bạo phát mà xuyên qua nhập vào thân thể của hắn.<br><div class="hidden-xs text-center ads-middle ads-holder"><iframe frameborder="0" width="480" height="270" src="//www.dailymotion.com/embed/video/x6kn1vz?autoplay-mute=1&amp;mute=1" allowfullscreen="" allow="autoplay"></iframe></div>Nghĩ mình xuyên không lấy được thân thế như vậy, Lục Thiếu Du có chút khóc không ra nước mắt, rốt cuộc nhân phẩm của mình tốt hay không tốt đây? Kiếp trước mình cũng chưa làm chuyện tốt gì, xem ra nhân phẩm cũng không thể tốt được a.<br><br>Nhập gia thì tùy tục, Lục Thiếu Du cũng không có cách nào khác, may mắn lắm mới không chết, trên đời này làm gì có chuyện thập toàn thập mỹ, dù thế nào đi chăng nữa không chết chính là có phúc, gặp đại nạn mà không chết tất sau này sẽ có phúc.<br><br>- Nể mặt ta và ngươi cùng tên là Lục Thiếu Du, ta lại dùng thân thể của ngươi, mối thù của ngươi sau này có cơ hội ta sẽ giúp ngươi báo, mẫu thân của ngươi ta cũng sẽ giúp ngươi chăm sóc.<br><br>Lục Thiếu Du thầm thì tự nói.<br><br>Lục Thiếu Du vừa nói xong, đầu óc dường như thông suốt, một cỗ trọc khí thoát ra từ đầu rồi tiêu tán không không gian.<br><br>- Xem ra oán khí của ngươi cũng sâu a, mối thù của ngươi, Lục Thiếu Du ta chỉ cần có cơ hội nhất định sẽ báo cho ngươi.<br><br>Lục Thiếu Du chăm chú nhìn lên trời cao nói lại một lần nữa.<br><br>Nói xong, Lục Thiếu Du không thể không nghĩ đến một vấn đề nan giải lúc này. Bây giờ hắn đang nằm trong đầm nước, dưới lưng dường như tựa vào một thân cây khô, nước trong đầm rất lạnh, xem ra bây giờ hẳn là mùa đông. Mà hắn ngâm trong nước đã lạnh đã rất lâu rồi thì phải, cả người đã sớm tê cóng, không còn bao nhiêu tri giác.<br><br>Giãy dụa cố bơi về hướng bên cạnh đầm nước, Lục Thiếu Du không khỏi thầm rủa một tiếng, hai chân của hắn dường như bị chặt đứt, hai tay thì ngay từ đầu còn không cảm thấy gì nhưng vừa cố di chuyển một chút thì phát hiện ra hai tay cũng bị gãy xương. Lúc này, hắn căn bản không thể dùng sức, đừng nói bơi đến bên cạnh đầm nước, ngay cả di chuyển nửa phân cũng khó có khả năng.<br><br>- Ông trời a, ngươi đừng chơi ta như vậy mà.<br><br>Lục Thiếu Du bất đắc dĩ nhìn trời mắng, bây giờ mình hoàn toàn không nhúc nhích được, không phải nằm chờ bị động lạnh đến chết sao?<br><br>- Vèo...<br><br>Một hồi âm thanh truyền vào trong tai Lục Thiếu Du, giống như là có con vật gì đó di chuyển trong nước với tốc độ vô cùng nhanh.<br><br>- Không phải là Yêu thú chứ?<br><br>Trong đầu Lục Thiếu Du hiện lên một từ đáng sợ, theo như tin tức trong đầu lưu lại, Lục Thiếu Du biết được thế giới này khác với thế giới trước kia của mình. Đây là thế giới lấy vũ vi tôn, toàn bộ thế giới bao la vô cùng, trong đó có Yêu thú, Linh thú, Vũ giả và Linh sư tồn tại.<br><br>Vũ giả và Linh sư trong thế giới này có địa vị vô cùng cao, đặc biệt là Linh sư, địa vị của họ có thể nói là tối thượng.<br><br>Mà thân thể của vị thiếu gia hắn xuyên qua này, không có cách nào trở thành Vũ giả cũng vô pháp trở thành Linh sư, chính vì vậy địa vị trong gia tộc mới thấp kém không bằng cả nô bộc.</div>'

const app = express()

// mongoose.connect(`mongodb://danghv:Dang2402@ds117719.mlab.com:17719/whoamid-project`)
// mongoose.connection.once('open', () => {
// 	console.log('connected to database')
// })

// mongoose.connect(`mongodb://DangHV:Dang2402@ds161856.mlab.com:61856/stories-demo`)
// mongoose.connection.once('open', () => {
// 	console.log('connected to database')
// })

mongoose.connect(`mongodb://danghv:Dang2402@ds117834.mlab.com:17834/full-story`)
mongoose.connection.once('open', () => {
	console.log('connected to database')
})

// mongoose.connect(`mongodb://dangha:Dang2402@ds163226.mlab.com:63226/story-category`)
// mongoose.connection.once('open', () => {
// 	console.log('connected to database')
// })
mongoose.set('useFindAndModify', false)

app.get('/test', async (req, res) => {
	const testData = await StorySchema.find({}).limit(5)
	console.log(testData)
	res.send(testData)
})

app.use('/graphql', graphqlHTTP({
	schema: schema,
	graphiql: true
}))
export default app