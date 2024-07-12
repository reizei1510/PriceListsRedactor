using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PriceListRedactor.DBTables;

namespace PriceListRedactor.Controllers
{
    [ApiController]
    [Route("/price-lists/")]
    public class PriceListsViewController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PriceListsViewController(ApplicationDbContext db)
        {
            _db = db;
        }

        // страница "Прайсы"
        [HttpGet]
        public IActionResult GetPriceLists()
        {
            string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/html/priceLists.html");

            return PhysicalFile(path, "text/html");
        }

        // страница "Добавление прайс-листа"
        [HttpGet("new")]
        public IActionResult AddPriceList()
        {
            string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/html/addPriceList.html");

            return PhysicalFile(path, "text/html");
        }

        // страница "Прайс-лист"
        [HttpGet("{id:int:min(1)}")]
        public async Task<IActionResult> GetPriceList([FromRoute] int id)
        {
            PriceList? priceList = await _db.PriceLists
                .FirstOrDefaultAsync(pl => pl.Id == id);

            if (priceList == null)
            {
                return NotFound();
            }

            string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/html/priceListContent.html");

            return PhysicalFile(path, "text/html");
        }
    }
}
