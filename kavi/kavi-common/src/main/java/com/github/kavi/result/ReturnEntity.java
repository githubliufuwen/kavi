package com.github.kavi.result;

import lombok.Data;

/**
 * @Author liufuwen
 * @Date 2023/1/6 14:31
 * @describtion:
 */
@Data
public class ReturnEntity<T> {

    private int code;

    private String message;

    private T data;

    private ReturnEntity(){}

    private ReturnEntity(int code,String msg,T data){
        this.code=code;
        this.message=msg;
        this.data=data;
    }



    public static ReturnEntity ok(){
        return new ReturnEntity(200,"ok",null);
    }

    public static ReturnEntity ok(String message){
        return new ReturnEntity(200,message,null);
    }

    public static <T> ReturnEntity ok(T data){
        return new ReturnEntity(200,"ok",data);
    }

    public static <T> ReturnEntity error(int code,String message){
        return new ReturnEntity(code,message,null);
    }

    public static <T> ReturnEntity error(String message){
        return new ReturnEntity(500,message,null);
    }




}
