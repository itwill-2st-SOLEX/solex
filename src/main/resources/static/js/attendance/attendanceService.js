// attendanceService.js

// 서버 API의 실제 주소들을 상수로 정의합니다.
const API_ENDPOINTS = {
    TODAY_STATUS: '/SOLEX/attendance/api/today', // 오늘 출퇴근 현황 조회
    PUNCH_IN: '/SOLEX/attendance/api/punch-in',         // 출근 등록
    PUNCH_OUT: '/SOLEX/attendance/api/punch-out'        // 퇴근 등록
};

/**
 * @function getTodayAttendanceStatus
 * @description 오늘의 출퇴근 현황 데이터를 서버로부터 가져옵니다.
 * @returns {Promise<Object>} 성공 시 출퇴근 데이터, 실패 시 에러를 반환하는 Promise
 */
export function getTodayAttendanceStatus() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: API_ENDPOINTS.TODAY_STATUS,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                resolve(response); // 성공하면 응답 데이터를 넘겨줍니다.
            },
            error: function(xhr, status, error) {
                console.error("오늘 출퇴근 현황 불러오기 실패:", error);
                alert('출퇴근 현황을 불러오는 데 실패했습니다. 다시 시도해주세요.');
                reject({ xhr, status, error }); // 실패하면 에러 정보를 넘겨줍니다.
            }
        });
    });
}

/**
 * @function punchIn
 * @description 현재 시각으로 출근을 기록합니다.
 * @returns {Promise<Object>} 성공 시 출근 기록 데이터, 실패 시 에러를 반환하는 Promise
 */
export function punchIn() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: API_ENDPOINTS.PUNCH_IN,
            method: 'POST',
            dataType: 'json',
            success: function(response) {
                alert('출근 등록이 완료되었습니다!');
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error("출근 등록 실패:", xhr.responseText);
                alert('출근 등록에 실패했습니다. 다시 시도해주세요. (오류: ' + xhr.responseText + ')');
                reject({ xhr, status, error });
            }
        });
    });
}

/**
 * @function punchOut
 * @description 해당 출근 기록 ID에 대한 퇴근을 기록합니다.
 * @param {string} attId - 퇴근 처리할 출근 기록의 고유 ID (attendance ID)
 * @returns {Promise<Object>} 성공 시 퇴근 기록 데이터, 실패 시 에러를 반환하는 Promise
 */
export function punchOut(attId) {
    return new Promise((resolve, reject) => {
        if (!attId) {
            const errorMessage = '퇴근 처리를 위한 출근 기록 ID가 없습니다.';
            alert(errorMessage);
            reject(new Error(errorMessage));
            return;
        }


        $.ajax({
            url: API_ENDPOINTS.PUNCH_OUT,
            method: 'POST',
            contentType: 'application/json', // JSON 형식으로 데이터 보냄
            data: JSON.stringify({ att_id: attId }), // att_id를 JSON 형태로 묶어 보냄
            success: function(response) {
                alert('퇴근 등록이 완료되었습니다!');
                resolve(response);
            },
            error: function(xhr, status, error) {
                console.error("HTTP 상태:", status);
                console.error("오류 객체:", error);
                console.error("퇴근 등록 실패:", xhr.responseText);
                alert('퇴근 등록에 실패했습니다. 다시 시도해주세요. (오류: ' + xhr.responseText + ')');
                reject({ xhr, status, error });
            }
        });
    });
}