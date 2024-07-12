using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PriceListRedactor.DBTables
{
    public class Row
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PriceListId { get; set; }
        [ForeignKey("PriceListId")]
        public PriceList PriceList { get; set; }

        public List<Cell> Cells { get; set; } = new();
    }
}
