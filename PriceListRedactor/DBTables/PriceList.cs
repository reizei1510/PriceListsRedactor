using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PriceListRedactor.DBTables
{
    public class PriceList
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public DateTime CreationDate { get; set; }

        public List<Column> Columns { get; set; } = new();
        public List<Row> Rows { get; set; } = new();
    }
}
