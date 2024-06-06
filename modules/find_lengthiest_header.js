async function find_lengthiest_header(data_pool) {
  if (data_pool.length === 0) {
    return {};
  }

  return data_pool.reduce(
    (maxObj, currentObj) =>
      Object.keys(currentObj).length > Object.keys(maxObj).length
        ? currentObj
        : maxObj,
    data_pool[0]
  );
}

module.exports = find_lengthiest_header;
