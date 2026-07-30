import { Request, Response } from "express";
import { whatsAppService } from "../services/whatsapp.service.js";
import { successResponse } from "../../../../../shared/utils/ApiResponse.js";

export const sendMessage = async (req:Request,res:Response)=>{
  const {to,message}= req.body;
  const response = await whatsAppService.sendTextMessage(to,message);
  return res.status(201).json(successResponse("message delivered successfully",response));
}