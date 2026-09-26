import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export class AnalyticsController {
 static async getOverview(req: Request, res: Response, next: NextFunction) {
 try {
 const period = (req.query.period as '7d' | '30d' | '12m') || '30d';
 const data = await AnalyticsService.getAnalyticsOverview(period);
 return sendSuccess(res, 'Analytics overview retrieved successfully', data);
 } catch (error) {
 next(error);
 }
 }

 static async getTopProducts(req: Request, res: Response, next: NextFunction) {
 try {
 const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
 const data = await AnalyticsService.getTopSellingProducts(limit);
 return sendSuccess(res, 'Top selling products retrieved successfully', data);
 } catch (error) {
 next(error);
 }
 }

 static async getCategoriesDistribution(_req: Request, res: Response, next: NextFunction) {
 try {
 const data = await AnalyticsService.getCategorySalesDistribution();
 return sendSuccess(res, 'Category sales distribution retrieved successfully', data);
 } catch (error) {
 next(error);
 }
 }

 static async exportCSVReport(_req: Request, res: Response, next: NextFunction) {
 try {
 const csvData = await AnalyticsService.generateSalesReportCSV();
 res.setHeader('Content-Type', 'text/csv');
 res.setHeader(
 'Content-Disposition',
 `attachment; filename=sales_report_${new Date().toISOString().slice(0, 10)}.csv`
 );
 return res.status(200).send(csvData);
 } catch (error) {
 next(error);
 }
 }
}
