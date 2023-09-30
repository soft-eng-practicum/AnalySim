using System;
using System.ComponentModel.DataAnnotations;

namespace Core.Entities
{
	public class ObservableNotebookDataset
	{
        [KeyAttribute]
        public int ID { get; set; }

        public string datasetName { get; set; }

        public string datasetURL { get; set; }

        public Notebook notebook
        {
            get; set;
        }

        public int NotebookID { get; set; }

    }
}

