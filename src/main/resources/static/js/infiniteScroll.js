// 모달 내부 무한스크롤 공통 함수
function initModalInfiniteScroll($container, onBottomReach) {
    $container.off('scroll').on('scroll', function () {
      const scrollTop = $container.scrollTop();
      const innerHeight = $container.innerHeight();
      const scrollHeight = $container[0].scrollHeight;

      if (scrollTop + innerHeight >= scrollHeight - 50) {
        onBottomReach(); // 스크롤 바닥에 닿으면 콜백 실행
      }
     });
 }
 
// ==> 이부분을 들고가서 사용 <div>부터 넣을 데이터를 바꾸심 될듯용!
// $('#exampleModal').on('shown.bs.modal', function () {
//   const $modalBody = $(this).find('.modal-body');
//
//   initModalInfiniteScroll($modalBody, function () {
//     $modalBody.append('<div class="big-box"><h1>Page</h1>asdf</div>');
//   });
// });

// TOAST UI Grid 무한스크롤 함수
//function gridInfiniteScroll(gridInstance, $gridContainer, fetchMoreCallback) {
//  let loading = false;
//
//  $gridContainer.off('scroll').on('scroll', function () {
//    const scrollTop = $gridContainer.scrollTop();
//    const scrollHeight = $gridContainer[0].scrollHeight;
//    const clientHeight = $gridContainer[0].clientHeight;
//
//    if (!loading && scrollTop + clientHeight >= scrollHeight - 50) {
//      loading = true;
//
//      fetchMoreCallback(function done() {
//        loading = false; // 외부에서 데이터 추가 후 호출
//      });
//    }
//  });
//}