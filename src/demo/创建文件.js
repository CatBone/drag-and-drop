fileEntity.file(function(file) {
  var reader = new FileReader()
  reader.onloadend = function(e) {
    var txt1 = document.getElementById('txt1')
    txt1.innerHTML = '写入文件成功：' + reader.result
  }
  reader.readAsText(file)
})
