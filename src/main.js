// getElementById
function $id(id) {
  return document.getElementById(id)
}

// 输出到html
function Output(msg) {
  var m = $id('messages')
  var box = $id('showbox')
  if (box.offsetHeight == 0) {
    box.style.display = 'block'
  }
  m.innerHTML = msg + m.innerHTML
}

// 需要用到这几个api，判断浏览器是否支持File特性
if (window.File && window.FileList && window.FileReader) {
  Init()
}

// initialize
function Init() {
  var fileselect = $id('fileselect'),
    filedrag = $id('filedrag'),
    submitbutton = $id('submitbutton')

  // file select
  fileselect.addEventListener('change', FileSelectHandler, false)
  filedrag.addEventListener('dragover', FileDragHover, false)
  filedrag.addEventListener('dragleave', FileDragHover, false)
  filedrag.addEventListener('drop', FileSelectHandler, false)
  filedrag.style.display = 'block'
}

// hover样式修改
function FileDragHover(e) {
  e.stopPropagation()
  e.preventDefault()
  e.target.dataset.drag = e.type == 'dragover' ? 'hover' : ''
}

// 主要逻辑，递归把文件夹树铺平 并对所有文件执行 ParseFile(file) 方法
function traverseFileTree(item) {
  var path = item.fullPath || ''
  /**
   * Object.prototype.toString.call(item)
   * @return [object FileEntry] or [object DirectoryEntry]
   * @description 关于FileEntry可以查阅MDN，目前没有标准规范
   */

  // 区分file和folder
  if (item.isFile) {
    item.file(function(e) {
      // The FileSystemFileEntry interface's method file() returns a File object
      // e 是File, 不是FileEntry, 即和input[type=file]上传的文件是同一类型
      // 这里用FileEntry提供的fullPath，而不是File的webkitRelativePath，是因为转换过后File拿不到Path了
      ParseFile(e, path)
    })
  } else if (item.isDirectory) {
    // 以下都是FileSystem 的 API
    var dirReader = item.createReader()
    /**
     * Object.prototype.toString.call(dirReader)
     * @return [object DirectoryReader]
     * @description returns a FileSystemDirectoryReader
     */
    dirReader.readEntries(function(entries) {
      // 读取文件夹目录所有文件[entries], 是一个ArrayLike
      ;[].forEach.call(entries, function(e) {
        // e 是FileEntry类型
        traverseFileTree(e)
      })
    })
  }
}

function FileSelectHandler(e) {
  FileDragHover(e)
  e.preventDefault()

  if (e.target.files) {
    // 如果是Input上传的文件(夹)
    var items = e.target.files
    ;[].forEach.call(items, function(item) {
      ParseFile(item)
    })
  } else if (e.dataTransfer.items) {
    // 拖拽的文件(夹)
    var items = e.dataTransfer.items
    ;[].forEach.call(items, function(e) {
      // webkitGetAsEntry  能把一个DataTransferItem返回的文件转换成FileEntry，目前仅webkit支持
      // it may be renamed to simply getAsEntry() in the future
      var getAsEntry = e.webkitGetAsEntry || e.getAsEntry
      var item = getAsEntry.call(e)
      if (item) {
        traverseFileTree(item)
      }
    })
  }
}

function ParseFile(file, path) {
  path = path || ''
  Output(
    `<tr>
      <th scope="row">${file.name}</th>
      <td>${file.type}</td>
      <td>${file.size}</td>
      <td>${path}</td>
    </tr>`
  )
}
