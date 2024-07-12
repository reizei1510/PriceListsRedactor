using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceListRedactor.DBTables;
using PriceListRedactor.DTO;

namespace PriceListRedactor.Controllers.API
{
    [ApiController]
    [Route("/api/price-lists/")]
    public class PriceListsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PriceListsController(ApplicationDbContext db)
        {
            _db = db;
        }

        // метод получения списка всех прайс-листов
        [HttpGet]
        public async Task<IActionResult> GetPriceListsAsync()
        {
            var priceLists = await _db.PriceLists
                .OrderBy(pl => pl.Id)
                .Select(pl => new
                {
                    pl.Id,
                    pl.Name
                })
                .ToListAsync();

            return Ok(priceLists);
        }


        // метод получения прайс-листа (колонок) по id
        [HttpGet("{id:int:min(1)}")]
        public async Task<IActionResult> GetPriceListAsync([FromRoute] int id)
        {
            PriceList? priceList = await _db.PriceLists
                .Include(pl => pl.Columns)
                .FirstOrDefaultAsync(pl => pl.Id == id);

            if (priceList == null)
            {
                return NotFound();
            }

            var priceListData = new
            {
                priceList.Id,
                priceList.Name,

                Columns = priceList.Columns
                    .OrderBy(c => c.Id)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Type
                    })
                    .ToList(),
            };

            return Ok(priceListData);
        }

        // метод добавления прайс-листа
        [HttpPost]
        public async Task<IActionResult> AddPriceListAsync([FromBody] PriceListData priceListData)
        {
            if (string.IsNullOrWhiteSpace(priceListData.Name))
            {
                return BadRequest();
            }

            PriceList priceList = new PriceList
            {
                Name = priceListData.Name,
                CreationDate = DateTime.Now,
                Columns = new List<Column>()
            };

            // Добавляем обязательные колонки
            priceList.Columns.Add(new Column
            {
                Name = "Название товара",
                Type = "text"
            });
            priceList.Columns.Add(new Column
            {
                Name = "Код товара",
                Type = "text"
            });

            foreach (ColumnData columnData in priceListData.Columns)
            {
                if (string.IsNullOrWhiteSpace(columnData.Name))
                {
                    return BadRequest();
                }

                priceList.Columns.Add(new Column
                {
                    Name = columnData.Name,
                    Type = columnData.Type
                });
            }

            await _db.PriceLists.AddAsync(priceList);
            await _db.SaveChangesAsync();

            return Ok();
        }

        // метод удаления прайс-листа по id
        [HttpDelete("{id:int:min(1)}")]
        public async Task<IActionResult> DeletePriceListAsync([FromRoute] int id)
        {
            PriceList? priceList = await _db.PriceLists
                .Where(pl => pl.Id == id)
                .FirstOrDefaultAsync();

            if (priceList == null)
            {
                return NotFound();
            }

            _db.PriceLists.Remove(priceList);
            await _db.SaveChangesAsync();

            return Ok();
        }
    }
}
