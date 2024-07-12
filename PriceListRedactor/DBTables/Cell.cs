using Microsoft.EntityFrameworkCore.Update.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PriceListRedactor.DBTables
{
    public class Cell
    {
        [Key]
        public int Id { get; set; }
        public string? Value { get; set; }

        [Required]
        public int RowId { get; set; }
        [ForeignKey("RowId")]
        public Row Row { get; set; }
        [Required]
        public int ColumnId { get; set; }
        [ForeignKey("ColumnId")]
        public Column Column { get; set; }
    }
}
