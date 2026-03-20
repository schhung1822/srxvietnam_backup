# Có gì mới trong React 19?
React 19 sắp ra mắt. Nhóm phát triển cốt lõi của React đã công bố bản phát hành ứng cử viên (RC) của React 19 vào tháng Tư vừa qua. Phiên bản chính này mang đến một số cập nhật và mô hình mới, nhằm mục đích cải thiện hiệu suất, tính dễ sử dụng và trải nghiệm của nhà phát triển.

Nhiều tính năng trong số này được giới thiệu dưới dạng thử nghiệm trong React 18, nhưng chúng sẽ được đánh dấu là ổn định trong React 19. Dưới đây là tổng quan về những điều bạn cần biết để sẵn sàng.

# Server Actions
Server Components là một trong những thay đổi lớn nhất đối với React kể từ khi phát hành lần đầu cách đây 10 năm. Chúng đóng vai trò là nền tảng cho các tính năng mới của React 19, cải thiện:

1. Thời gian tải trang ban đầu. Bằng cách hiển thị các thành phần trên máy chủ, chúng giảm lượng JavaScript được gửi đến máy khách, dẫn đến tốc độ tải ban đầu nhanh hơn. Chúng cũng cho phép các truy vấn dữ liệu bắt đầu trên máy chủ trước khi trang được gửi đến máy khách.

2. Tính di động của mã. Server Components cho phép các nhà phát triển viết các thành phần có thể chạy trên cả máy chủ và máy khách, giúp giảm sự trùng lặp, cải thiện khả năng bảo trì và cho phép chia sẻ logic dễ dàng hơn trong toàn bộ mã nguồn.

3. SEO. Việc hiển thị các thành phần phía máy chủ cho phép các công cụ tìm kiếm và hệ thống quản lý ngôn ngữ lập trình (LLM) thu thập thông tin và lập chỉ mục nội dung hiệu quả hơn, từ đó cải thiện khả năng tối ưu hóa công cụ tìm kiếm.

Trong bài viết này , chúng ta sẽ không đi sâu vào Server Components hay các chiến lược render . Tuy nhiên, để hiểu được tầm quan trọng của Server Components, hãy cùng điểm qua sự phát triển của quá trình render trong React.

React bắt đầu với Client-Side Rendering (CSR), phương pháp này chỉ cung cấp một lượng HTML tối thiểu cho người dùng.

Tập lệnh được liên kết bao gồm mọi thứ về ứng dụng của bạn—React, các thư viện bên thứ ba và toàn bộ mã ứng dụng. Khi ứng dụng của bạn phát triển, kích thước gói cũng tăng lên. JavaScript được tải xuống và phân tích cú pháp, sau đó React tải các phần tử DOM vào thẻ div trống. Trong khi điều này đang diễn ra, người dùng chỉ thấy một trang trắng.

Ngay cả khi giao diện người dùng ban đầu cuối cùng cũng hiển thị, nội dung trang vẫn chưa đầy đủ, đó là lý do tại sao các khung sườn tải dữ liệu trở nên phổ biến. Dữ liệu sau đó được tải về và giao diện người dùng được hiển thị lần thứ hai, thay thế các khung sườn tải dữ liệu bằng nội dung thực tế.

React đã được cải tiến với Server-Side Rendering (SSR), giúp chuyển quá trình render đầu tiên lên máy chủ. HTML được gửi đến người dùng không còn trống nữa, và điều này giúp cải thiện tốc độ người dùng nhìn thấy giao diện người dùng ban đầu. Tuy nhiên, dữ liệu vẫn cần được tải về để hiển thị nội dung thực tế.

Các framework React đã góp phần cải thiện hơn nữa trải nghiệm người dùng với các khái niệm như Static-Site Generation (SSG), giúp lưu trữ và hiển thị dữ liệu động trong quá trình xây dựng , và Incremental Static Regeneration (ISR), giúp lưu trữ lại và hiển thị lại dữ liệu động theo yêu cầu.

Điều này dẫn chúng ta đến với React Server Components (RSC). Lần đầu tiên, tính năng gốc của React cho phép chúng ta lấy dữ liệu trước khi giao diện người dùng được hiển thị cho người dùng.

HTML được hiển thị cho người dùng đã được điền đầy đủ nội dung thực tế ngay từ lần hiển thị đầu tiên, và không cần phải tải thêm dữ liệu hoặc hiển thị lại lần thứ hai.

Server Components là một bước tiến lớn về tốc độ và hiệu năng, mang lại trải nghiệm tốt hơn cho cả nhà phát triển và người dùng. Tìm hiểu thêm về React Server Components .
# Chỉ thị mới

Các chỉ thị không phải là tính năng của React 19, nhưng chúng có liên quan. Với sự ra mắt của React Server Components, các trình đóng gói cần phân biệt nơi các thành phần và hàm được thực thi. Để thực hiện điều này, có hai chỉ thị mới cần lưu ý khi tạo các thành phần React:

1. 'use client'Đánh dấu đoạn mã chỉ chạy trên máy khách. Vì Server Components là mặc định, bạn sẽ thêm 'use client'vào Client Components khi sử dụng hook để tương tác và quản lý trạng thái.

2. 'use server'Thuộc tính `<server-side>` đánh dấu các hàm phía máy chủ có thể được gọi từ mã phía máy khách. Bạn không cần thêm 'use server'vào `Server Components`, chỉ cần thêm vào `Server Actions` (chi tiết hơn ở bên dưới). Nếu bạn muốn đảm bảo một đoạn mã cụ thể chỉ có thể chạy trên máy chủ, bạn có thể sử dụng server-onlygói `npm` .

# Hành động
React 19 giới thiệu Actions. Các chức năng này thay thế việc sử dụng trình xử lý sự kiện và tích hợp với các hiệu ứng chuyển tiếp và tính năng xử lý đồng thời của React.

Các hành động có thể được sử dụng cả ở phía máy khách và máy chủ. Ví dụ, bạn có thể có một Hành động phía máy khách thay thế việc sử dụng trước đó onSubmitcho một biểu mẫu.

Thay vì phải phân tích sự kiện, hành động được truyền trực tiếp tham số FormData.
# Hành động của máy chủ

Hơn nữa, Server Actions cho phép các Client Components gọi các hàm bất đồng bộ được thực thi trên máy chủ. Điều này mang lại những lợi thế bổ sung, chẳng hạn như đọc hệ thống tập tin hoặc thực hiện các cuộc gọi trực tiếp đến cơ sở dữ liệu, loại bỏ nhu cầu tạo các điểm cuối API riêng biệt cho giao diện người dùng của bạn.

Các hành động được định nghĩa bằng 'use server'chỉ thị và tích hợp với các thành phần phía máy khách.

# new hook
Để bổ sung cho Actions, React 19 giới thiệu ba hook mới giúp việc quản lý trạng thái, tình trạng và phản hồi trực quan trở nên dễ dàng hơn. Chúng đặc biệt hữu ích khi làm việc với biểu mẫu, nhưng cũng có thể được sử dụng trên các phần tử khác, chẳng hạn như nút bấm.

## useActionState
Hook này giúp đơn giản hóa việc quản lý trạng thái và việc gửi biểu mẫu. Sử dụng Actions, nó thu thập dữ liệu đầu vào của biểu mẫu, xử lý xác thực và trạng thái lỗi, giảm thiểu nhu cầu về logic quản lý trạng thái tùy chỉnh. useActionStateHook này cũng cung cấp một pendingtrạng thái có thể hiển thị chỉ báo tải trong khi hành động đang được thực thi.

## useFormStatus
Hook này quản lý trạng thái của lần gửi biểu mẫu cuối cùng và nó phải được gọi từ bên trong một component cũng nằm trong một form.
Mặc dù useActionState có trạng thái được tích hợp sẵn pending, useFormStatus nhưng nó vẫn hữu ích khi:

1. Không có trạng thái hình thức

2. Tạo các thành phần biểu mẫu dùng chung

3. Trên cùng một trang có nhiều biểu mẫu — useFormStatus hệ thống chỉ trả về thông tin trạng thái của biểu mẫu cha.

## useOptimistic
Hook này cho phép bạn cập nhật giao diện người dùng một cách lạc quan trước khi Hành động máy chủ hoàn tất, thay vì chờ phản hồi. Khi hành động bất đồng bộ hoàn tất, giao diện người dùng sẽ được cập nhật với trạng thái cuối cùng từ máy chủ.

Ví dụ sau đây minh họa cách thêm một tin nhắn mới vào luồng thảo luận ngay lập tức, đồng thời tin nhắn đó cũng được gửi đến Hành động Máy chủ để lưu trữ.

# new API : use
Chức năng này usecung cấp hỗ trợ hàng đầu cho các promise và context trong quá trình render. Không giống như các React Hook khác, usenó có thể được gọi trong các vòng lặp, câu lệnh điều kiện và return sớm. Việc xử lý lỗi và tải sẽ được thực hiện bởi ranh giới Suspense gần nhất.

Ví dụ sau đây hiển thị thông báo đang tải trong khi quá trình xử lý yêu cầu về các mặt hàng trong giỏ hàng đang được hoàn tất.

Điều này cho phép bạn nhóm các thành phần lại với nhau để chúng chỉ hiển thị khi tất cả dữ liệu của các thành phần đó đã có sẵn.

# Tải trước tài nguyên

React 19 bổ sung một số API mới để cải thiện hiệu suất tải trang và trải nghiệm người dùng bằng cách tải và tải trước các tài nguyên như tập lệnh, bảng định kiểu và phông chữ.

prefetchDNS Tải trước địa chỉ IP của tên miền DNS mà bạn dự định kết nối đến.

preconnect Kết nối với máy chủ mà bạn dự kiến ​​sẽ yêu cầu tài nguyên từ đó, ngay cả khi chưa biết chính xác các tài nguyên đó là gì vào thời điểm đó.

preload Tải về tệp định kiểu, phông chữ, hình ảnh hoặc tập lệnh bên ngoài mà bạn dự định sử dụng.

preloadModule Tải về mô-đun ESM mà bạn dự định sử dụng.

preinit Tải về và đánh giá một tập lệnh bên ngoài hoặc tải về và chèn một bảng định kiểu.

preinitModule Truy xuất và đánh giá một mô-đun ESM.

Ví dụ, đoạn mã React này sẽ tạo ra đầu ra HTML như sau. Lưu ý rằng các liên kết và tập lệnh được ưu tiên và sắp xếp theo thứ tự thời gian tải, chứ không phải dựa trên thứ tự sử dụng trong React.

Các framework React thường tự động xử lý việc tải tài nguyên như vậy, vì vậy bạn có thể không cần phải tự gọi các API này.

# Những cải tiến khác
- ref as a prop

Không cần thiết phải làm vậy forwardRefnữa. React sẽ cung cấp một công cụ chỉnh sửa mã để giúp quá trình chuyển đổi dễ dàng hơn.

- ref callback

Ngoài việc được sử dụng refnhư một prop, refs cũng có thể trả về một hàm callback để dọn dẹp. Khi một component bị unmount, React sẽ gọi hàm dọn dẹp đó.

# Liên kết đến tiêu đềContextvới tư cách là nhà cung cấp
Không cần thiết phải làm vậy <Context.Provider>nữa. Bạn có thể sử dụng <Context>trực tiếp. React sẽ cung cấp một công cụ chuyển đổi mã (codemod) để chuyển đổi các nhà cung cấp hiện có.

# Liên kết đến tiêu đề useDeferredValuegiá trị ban đầu
Một initialValuetùy chọn đã được thêm vào useDeferredValue. Khi được cung cấp, useDeferredValuesẽ sử dụng giá trị này cho lần hiển thị ban đầu và lên lịch hiển thị lại trong nền, trả về giá trị đó deferredValue.
# Hỗ trợ siêu dữ liệu tài liệu
React 19 sẽ tự động nâng cấp và hiển thị các thẻ title, link và meta, ngay cả từ các component lồng nhau. Không cần đến các giải pháp của bên thứ ba để quản lý các thẻ này nữa.
# Hỗ trợ bảng định kiểu
React 19 cho phép kiểm soát thứ tự tải stylesheet bằng cách sử dụng `<stylesheet>` precedence. Điều này giúp việc đặt stylesheet gần các component dễ dàng hơn, và React chỉ tải chúng nếu chúng được sử dụng.

Có một vài điểm cần lưu ý:

Nếu bạn hiển thị cùng một thành phần ở nhiều vị trí khác nhau trong ứng dụng của mình, React sẽ loại bỏ các bản sao trùng lặp của stylesheet và chỉ bao gồm nó một lần trong tài liệu.

Khi thực hiện render phía máy chủ, React sẽ thêm tệp CSS vào phần <head>. Điều này đảm bảo rằng trình duyệt sẽ không hiển thị nội dung cho đến khi tệp CSS được tải xong.

Nếu tệp định kiểu được phát hiện sau khi quá trình truyền dữ liệu bắt đầu, React sẽ đảm bảo rằng tệp định kiểu được chèn vào phía <head>máy khách trước khi hiển thị nội dung phụ thuộc vào tệp định kiểu đó thông qua ranh giới Suspense.

Trong quá trình hiển thị phía máy khách, React sẽ chờ các bảng định kiểu mới được tải xong trước khi hoàn tất quá trình hiển thị.
# Hỗ trợ tập lệnh bất đồng bộ
Hiển thị các script bất đồng bộ trong bất kỳ component nào. Điều này giúp việc đặt script gần các component dễ dàng hơn, và React chỉ tải chúng nếu chúng được sử dụng.

Có một vài điểm cần lưu ý:

Nếu bạn hiển thị cùng một thành phần ở nhiều vị trí khác nhau trong ứng dụng của mình, React sẽ loại bỏ các đoạn mã trùng lặp và chỉ bao gồm nó một lần trong tài liệu.

Khi thực hiện render phía máy chủ, các script bất đồng bộ sẽ được đưa vào phần head và được ưu tiên sau các tài nguyên quan trọng hơn gây cản trở quá trình hiển thị, chẳng hạn như stylesheet, font và tải trước hình ảnh.
# Liên kết đến tiêu đềHỗ trợ các phần tử tùy chỉnh
Custom Elements cho phép các nhà phát triển định nghĩa các phần tử HTML riêng của họ như một phần của đặc tả Web Components . Trong các phiên bản React trước đây, việc sử dụng Custom Elements gặp khó khăn vì React coi các props không được nhận dạng là thuộc tính chứ không phải là đặc tính.

React 19 bổ sung hỗ trợ đầy đủ cho Custom Elements và vượt qua tất cả các bài kiểm tra về Custom Elements Everywhere .

Liên kết đến tiêu đề
# Báo cáo lỗi tốt hơn
Việc xử lý lỗi được cải thiện bằng cách loại bỏ các thông báo lỗi trùng lặp.
Các lỗi liên quan đến quá trình cấp nước được cải thiện bằng cách chỉ ghi lại một lỗi không khớp duy nhất thay vì nhiều lỗi. Thông báo lỗi cũng bao gồm thông tin về cách khắc phục lỗi.
Các lỗi liên quan đến việc cấp phát nội dung khi sử dụng các tập lệnh của bên thứ ba và tiện ích mở rộng trình duyệt cũng được cải thiện. Trước đây, các phần tử được chèn bởi các tập lệnh của bên thứ ba hoặc tiện ích mở rộng trình duyệt sẽ gây ra lỗi không khớp. Trong React 19, các thẻ không mong muốn trong phần head và body sẽ được bỏ qua và sẽ không gây ra lỗi.

Cuối cùng, React 19 bổ sung thêm hai tùy chọn gốc mới bên cạnh các tùy chọn hiện có onRecoverableError, nhằm cung cấp thông tin rõ ràng hơn về lý do xảy ra lỗi.

onCaughtError Sự kiện này được kích hoạt khi React bắt được lỗi trong Error Boundary.

onUncaughtError Sự kiện này được kích hoạt khi một lỗi được ném ra và không được bắt bởi một Error Boundary.

onRecoverableError Sự kiện này được kích hoạt khi xảy ra lỗi và tự động khắc phục.