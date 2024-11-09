use std::{ ffi::c_char, sync::mpsc, thread };

thread_local! {
    static RXS: std::cell::RefCell<
        std::collections::HashMap<String, mpsc::Receiver<String>>
    > = std::cell::RefCell::new(std::collections::HashMap::new());
}

#[no_mangle]
pub extern "C" fn create_channel(id: *const c_char) -> *const mpsc::Sender<String> {
    let (tx, rx) = mpsc::channel();

    let id = unsafe { std::ffi::CStr::from_ptr(id).to_str().unwrap() };

    RXS.with(|rxs| {
        rxs.borrow_mut().insert(id.to_string(), rx);
    });

    Box::into_raw(Box::new(tx))
}

#[no_mangle]
pub extern "C" fn await_message(id: *const c_char) -> *const c_char {
    let id = unsafe { std::ffi::CStr::from_ptr(id).to_str().unwrap() };

    let rx = RXS.with(|rxs| { rxs.borrow_mut().remove(id).unwrap() });

    let msg = rx.recv().unwrap();

    std::ffi::CString::new(msg).unwrap().into_raw()
}

#[no_mangle]
pub extern "C" fn test_showmap() {
    RXS.with(|rxs| {
        let rxs = rxs.borrow();
        for (k, v) in rxs.iter() {
            dbg!(k, v);
        }
    });
}

#[no_mangle]
pub extern "C" fn test_async(tx: *const mpsc::Sender<String>, text: *const c_char) {
    let tx = unsafe { &*tx };
    let text = unsafe { std::ffi::CStr::from_ptr(text).to_str().unwrap() };

    thread::spawn(move || {
        thread::sleep(std::time::Duration::from_secs(5));

        tx.send(text.to_string()).unwrap();
    });
}
