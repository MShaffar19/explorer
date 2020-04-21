import React, { Component } from 'react'
import { Typography, Tag, Table, Card } from 'antd'
import { CodeSandboxOutlined } from '@ant-design/icons'
import Client from '@helium/http'
import Timestamp from 'react-timestamp'
import TxnTag from '../components/TxnTag'
import AppLayout, { Content } from '../components/AppLayout'
import LoadMoreButton from '../components/LoadMoreButton'

const { Title, Text } = Typography

const PAGE_SIZE = 20

const initialState = {
  block: {},
  txns: [],
  loading: true,
  hasMore: true,
}

class BlockView extends Component {
  state = initialState

  componentDidMount() {
    this.client = new Client()
    this.loadData()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.loadData()
    }
  }

  loadData = async () => {
    const { hash } = this.props.match.params
    await this.setState(initialState)
    const [block, txnList] = await Promise.all([
      this.client.blocks.get(hash),
      this.client.block(hash).transactions.list(),
    ])
    this.txnList = txnList
    this.setState({ block, loading: false })
    this.loadMoreTxns()
  }

  loadMoreTxns = async () => {
    const { txns } = this.state
    const nextTxns = await this.txnList.take(PAGE_SIZE)
    const hasMore = nextTxns.length === PAGE_SIZE
    this.setState({ txns: [...txns, ...nextTxns], hasMore })
  }

  render() {
    const { block, loading, txns, hasMore } = this.state

    const txnColumns = [
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (data) => <TxnTag type={data}></TxnTag>,
      },
      {
        title: 'Hash',
        dataIndex: 'hash',
        key: 'hash',
        render: (hash) => <a href={'/txns/' + hash}>{hash}</a>,
      },
      {
        title: 'Fee (DC)',
        dataIndex: 'fee',
        key: 'fee',
      },
    ]

    const paymentColumns = [
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Hash',
        dataIndex: 'hash',
        key: 'hash',
        render: (hash) => <a href={'/txns/' + hash}>{hash}</a>,
      },
      {
        title: 'Fee',
        dataIndex: 'fee',
        key: 'fee',
      },
    ]

    const pocColumns = [
      {
        title: 'Challenger',
        dataIndex: 'challenger',
        key: 'challenger',
      },
      {
        title: 'Hash',
        dataIndex: 'hash',
        key: 'hash',
        render: (hash) => <a href={'/txns/' + hash}>{hash}</a>,
      },
      {
        title: 'Fee',
        dataIndex: 'fee',
        key: 'fee',
      },
    ]

    return (
      <AppLayout>
        <Content style={{ marginTop: 50 }}>
          <Card loading={loading}>
            <Title>
              <CodeSandboxOutlined /> Block {block.height}
            </Title>
            <p>
              <Text strong>Hash:</Text>
              <Text code copyable>
                {block.hash}
              </Text>
            </p>
            <Tag color="green">
              <Timestamp date={block.time}></Timestamp>
            </Tag>
            {txns.length > 0 && (
              <Tag color="blue">{block.transactionCount} transactions</Tag>
            )}
          </Card>
        </Content>

        <Content style={{ marginTop: '10px' }}>
          <Card loading={loading} title="Transactions">
            <Table
              dataSource={txns}
              columns={txnColumns}
              size="small"
              rowKey="hash"
              pagination={false}
              scroll={{ x: true }}
            />
            {hasMore && <LoadMoreButton onClick={this.loadMoreTxns} />}
          </Card>
        </Content>
      </AppLayout>
    )
  }
}

export default BlockView
