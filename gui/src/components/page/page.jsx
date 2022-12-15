import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import { pages, pageActions, addFields } from "../../config";
import { get_generic } from "../../services/http_operations";
import ContentTable from "../contentTable/contentTable";
import { useParams, useSearchParams } from "react-router-dom";
import { Pagination } from "react-bootstrap";
import "./page.scss";

import fontawesome from "@fortawesome/fontawesome";
import { faPlusCircle } from "@fortawesome/fontawesome-free-solid";
fontawesome.library.add(faPlusCircle);

export default function Page(params) {
  const { page } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resource, setResource] = useState(undefined);
  const [header, setHeader] = useState(undefined);
  const [actions, setActions] = useState(undefined);

  const [pageNum, setPageNum] = useState(1);
  const [pageLimit, setPageLimit] = useState(1);

  const [hasNext, setHasNext] = useState();
  const [hasPrev, setHasPrev] = useState();

  const [prevPage, setPrevPage] = useState();
  const [nextPage, setNextPage] = useState();

  const [totalPages, setTotalPages] = useState();

  useEffect(() => {
    // declare the async data fetching function
    const fetchData = async (qs = {}) => {
      // get the data from the api
      try {
        const response = await get_generic(page, qs);

        // set state with the result
        setHeader(pages[page]);
        setResource(response.docs);
        if (pageActions[page] !== undefined) setActions(pageActions[page]);

        setHasNext(response.hasNextPage);
        setHasPrev(response.hasPrevPage);

        setTotalPages(response.totalPages);

        setPrevPage(response.prevPage);
        setNextPage(response.nextPage);
      } catch (error) {
        console.log(error);

        setHeader(undefined);
        setResource(undefined);
        setHasNext(undefined);
        setHasPrev(undefined);
        setTotalPages(undefined);
        setPrevPage(undefined);
        setNextPage(undefined);
      }
    };

    //get params for pagination
    const num =
      searchParams.get("page") !== null ? searchParams.get("page") : 1;
    setPageNum(num);

    const limit =
      searchParams.get("limit") !== null ? searchParams.get("limit") : 10;
    setPageLimit(limit);

    const qs = { page: num, limit: limit };

    // call the function
    fetchData(qs)
      // make sure to catch any error
      .catch(console.error);
  }, [params, page, searchParams]);

  const takeSingle = (id) => {
    return resource.find((r) => r._id === id);
  };

  const removeSingle = (id) => {
    let tmp = resource.filter((el) => {
      return el._id !== id;
    });
    setResource(tmp);
  };

  const RenderPagination = () => {
    const prevEllipsis = parseInt(pageNum, 10) - 2 > 0;
    const nextEllipsis = parseInt(pageNum, 10) + 2 < totalPages;

    return (
      <div style={{ display: "inline-flex", width: 100 + "%" }}>
        <Pagination
          style={{
            alignSelf: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Pagination.First
            disabled={pageNum === 1}
            onClick={() => setSearchParams({ page: 1, limit: pageLimit })}
          />
          <Pagination.Prev
            disabled={!hasPrev}
            onClick={() =>
              setSearchParams({ page: prevPage, limit: pageLimit })
            }
          />
          {prevEllipsis && <Pagination.Ellipsis />}
          {parseInt(pageNum, 10) - 1 > 0 && (
            <Pagination.Item
              onClick={() =>
                setSearchParams({
                  page: parseInt(pageNum, 10) - 1,
                  limit: pageLimit,
                })
              }
            >
              {parseInt(pageNum, 10) - 1}
            </Pagination.Item>
          )}
          <Pagination.Item>
            <b>{pageNum}</b>
          </Pagination.Item>
          {parseInt(pageNum, 10) + 1 <= totalPages && (
            <Pagination.Item
              onClick={() =>
                setSearchParams({
                  page: parseInt(pageNum, 10) + 1,
                  limit: pageLimit,
                })
              }
            >
              {parseInt(pageNum, 10) + 1}
            </Pagination.Item>
          )}
          {nextEllipsis && <Pagination.Ellipsis />}

          <Pagination.Next
            disabled={!hasNext}
            onClick={() =>
              setSearchParams({ page: nextPage, limit: pageLimit })
            }
          />
          <Pagination.Last
            disabled={pageNum === totalPages}
            onClick={() =>
              setSearchParams({ page: totalPages, limit: pageLimit })
            }
          />
        </Pagination>
      </div>
    );
  };
  return (
    <div className="page">
      <header className="page-header">
        {page}

        {addFields[page] !== undefined && (
          <NavLink to={`/add/` + page + "/"} key={page + "_add_navlink"}>
            <Button variant="link" size="sm" key={page + "button"}>
              <i
                key={page + "icon"}
                className="fa fa-plus-circle"
                aria-hidden="true"
                title={"Add"}
                style={{
                  width: 30 + "px",
                  height: 30 + "px",
                  marginRight: 10 + "px",
                  opacity: 0.85,
                }}
              ></i>
            </Button>
          </NavLink>
        )}
      </header>
      <main className="page-content">
        <ContentTable
          resType={page}
          header={header}
          resources={resource}
          actions={actions}
          takeSingle={takeSingle}
          removeSingle={removeSingle}
        />
        <RenderPagination />
      </main>
    </div>
  );
}
