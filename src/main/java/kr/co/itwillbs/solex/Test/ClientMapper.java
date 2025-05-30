package kr.co.itwillbs.solex.Test;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ClientMapper {
	List<Client> selectAllClients();
}
