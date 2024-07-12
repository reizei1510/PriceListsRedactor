using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceListRedactor.DBTables;
using PriceListRedactor.DTO;

namespace PriceListRedactor.Controllers.API
{
    [ApiController]
    [Route("/api/products/")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ProductsController(ApplicationDbContext db)
        {
            _db = db;
        }

        // метод получения товаров по id прайс-листа
        [HttpGet("{id:int:min(1)}")]
        public async Task<IActionResult> GetProductsAsync([FromRoute] int id)
        {
            PriceList? priceList = await _db.PriceLists
                .Include(pl => pl.Rows)
                    .ThenInclude(r => r.Cells)
                .FirstOrDefaultAsync(pl => pl.Id == id);

            if (priceList == null)
            {
                return NotFound();
            }

            var rowsData = priceList.Rows
                .OrderBy(r => r.Id)
                .Select(r => new
                {
                    r.Id,
                    Cells = r.Cells
                    .OrderBy(c => c.ColumnId)
                    .Select(c => new
                    {
                        c.ColumnId,
                        c.Value
                    })
                    .ToList()
                })
                .ToList();

            return Ok(rowsData);
        }

        // метод добавления товара по id прайс-листа
        [HttpPost("{id:int:min(1)}")]
        public async Task<IActionResult> AddProductAsync([FromRoute] int id, [FromBody] List<CellData> cellsData)
        {
            PriceList? priceList = await _db.PriceLists
                .Where(pl => pl.Id == id)
                .FirstOrDefaultAsync();

            if (priceList == null)
            {
                return NotFound();
            }

            if (cellsData.Any(cell => (cell.ColumnName == "name" || cell.ColumnName == "code") && string.IsNullOrEmpty(cell.Value)))
            {
                return BadRequest();
            }

            List<Cell> cellsList = new List<Cell>();
            foreach (CellData cellData in cellsData)
            {
                Cell cell = new Cell
                {
                    ColumnId = cellData.ColumnId,
                    Value = cellData.Value
                };

                cellsList.Add(cell);
            }

            Row row = new Row()
            {
                PriceList = priceList,
                Cells = cellsList
            };

            await _db.Rows.AddAsync(row);
            await _db.SaveChangesAsync();

            return Ok(row.Id);
        }

        // метод удаления товара по id строки
        [HttpDelete("{id:int:min(1)}")]
        public async Task<IActionResult> DeleteProductAsync([FromRoute] int id)
        {
            Row? product = await _db.Rows
                .Where(r => r.Id == id)
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound();
            }

            _db.Rows.Remove(product);
            await _db.SaveChangesAsync();

            return Ok();
        }
    }
}
