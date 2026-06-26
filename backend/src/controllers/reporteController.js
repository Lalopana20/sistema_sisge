const ReporteService = require('../services/reporteService');
const ExcelJS = require('exceljs');

const ReporteController = {
  async dashboard(req, res, next) {
    try {
      const data = await ReporteService.dashboardCompleto();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async dashboardKpis(req, res, next) {
    try {
      const data = await ReporteService.dashboardKpis();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async porCategoria(req, res, next) {
    try {
      const data = await ReporteService.reportePorCategoria(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async porProducto(req, res, next) {
    try {
      const data = await ReporteService.reportePorProducto(req.query);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async stockBajo(req, res, next) {
    try {
      const data = await ReporteService.reporteStockBajo();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async porTecnico(req, res, next) {
    try {
      const data = await ReporteService.reportePorTecnico();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // Detalle de consumo por técnico con filtros opcionales de fecha e id_tecnico
  async consumoPorTecnico(req, res, next) {
    try {
      const { id_tecnico, fecha_inicio, fecha_fin } = req.query;
      const data = await ReporteService.porTecnico({ id_tecnico, fecha_inicio, fecha_fin });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async exportar(req, res, next) {
    try {
      const { tipo } = req.query;
      const data = await ReporteService.exportarData(tipo);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SISGE';
      workbook.created = new Date();

      if (data.productos) {
        const sheet = workbook.addWorksheet('Productos');
        sheet.columns = [
          { header: 'ID', key: 'id', width: 6 },
          { header: 'Nombre', key: 'nombre', width: 30 },
          { header: 'Categoría', key: 'categoria', width: 20 },
          { header: 'Stock Actual', key: 'stock_actual', width: 14 },
          { header: 'Stock Mínimo', key: 'stock_minimo', width: 14 },
          { header: 'Unidad', key: 'unidad_medida', width: 10 },
        ];
        data.productos.forEach(r => sheet.addRow(r));
        sheet.getRow(1).font = { bold: true };
      }

      if (data.movimientos) {
        const sheet = workbook.addWorksheet('Movimientos');
        sheet.columns = [
          { header: 'ID', key: 'id', width: 6 },
          { header: 'Producto', key: 'producto', width: 30 },
          { header: 'Tipo', key: 'tipo', width: 14 },
          { header: 'Cantidad', key: 'cantidad', width: 10 },
          { header: 'Stock Anterior', key: 'stock_anterior', width: 16 },
          { header: 'Stock Nuevo', key: 'stock_nuevo', width: 14 },
          { header: 'Usuario', key: 'usuario', width: 20 },
          { header: 'Fecha', key: 'fecha', width: 20 },
        ];
        data.movimientos.forEach(r => sheet.addRow(r));
        sheet.getRow(1).font = { bold: true };
      }

      if (data.ubicaciones) {
        const sheet = workbook.addWorksheet('Ubicaciones');
        sheet.columns = [
          { header: 'ID', key: 'id', width: 6 },
          { header: 'Producto', key: 'producto', width: 30 },
          { header: 'Técnico', key: 'tecnico', width: 20 },
          { header: 'Ubicación', key: 'ubicacion', width: 25 },
          { header: 'Estado', key: 'estado', width: 16 },
          { header: 'Fecha Esperada Dev', key: 'fecha_esperada_dev', width: 20 },
        ];
        data.ubicaciones.forEach(r => sheet.addRow(r));
        sheet.getRow(1).font = { bold: true };
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${new Date().toISOString().slice(0, 10)}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) { next(err); }
  },
};

module.exports = ReporteController;
