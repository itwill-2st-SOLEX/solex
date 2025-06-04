package kr.co.itwillbs.solex.client;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ClientMapper {
	
	List<Map<String,Object>> selectAllClients();

	int createClients(Map<String , Object>param);

	Map<String, Object> getClientById(int clientId);
}
