package kr.co.itwillbs.solex.mypage;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MypageService {

	@Autowired
	private MypageMapper mypageMapper;
	
	@Value("${file.upload-dir}")
	private String uploadDir;
	
	// 로그인 된 정보의 마이페이지 가져오기 
	public Map<String, Object> getEmpData(String empId) {
		
		Map<String, Object> empData = mypageMapper.getEmpData(empId);
		System.out.println("empData = " + empData);
		
		Object empImgObject = empData.get("EMP_IMG"); // DB 컬럼명이 EMP_IMG라고 가정
        String imageName = (String) empImgObject;
		System.out.println("imageName = " + imageName);
        empData.put("empProfileImg", imageName);
   
		return empData;
	}

	
	
	public void modifyPersonalData(String empId, Map<String, Object> empMap, MultipartFile newFile) throws IOException {

        // 새로운 파일 있을때만
        if (newFile != null && !newFile.isEmpty()) {
            // 새 파일을 서버에 저장
            String originalFilename = newFile.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String storedFileName = UUID.randomUUID().toString() + extension;
            File saveFile = new File(uploadDir, storedFileName);
            newFile.transferTo(saveFile);

            // DB에 업데이트할 데이터(empMap)에 새로운 파일명을 추가
            empMap.put("emp_img", storedFileName);

            // DB에서 기존 파일명을 조회 (나중에 삭제하기 위해)
            String oldFileName = mypageMapper.findImageNameByEmpId(empId);

            // 서버에 저장되어 있던 '기존' 파일을 삭제 (기존 파일이 존재할 경우에만)
            if (oldFileName != null && !oldFileName.isEmpty()) {
            	File fileToDelete = new File(uploadDir, oldFileName);
                if (fileToDelete.exists()) {
                    fileToDelete.delete();
                }
            }
        }

        // WHERE 절에 사용할 ID를 empMap에 추가
        empMap.put("empId", empId);

        // Mapper를 호출하여 DB 업데이트
        // (empMap에 emp_img가 있으면 사진도 변경, 없으면 사진 외 정보만 변경)
        mypageMapper.modifyPersonalData(empMap);
    }

}